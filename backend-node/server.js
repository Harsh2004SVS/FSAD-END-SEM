const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_super_secret_jwt_key_mvp';

app.use(cors());
app.use(express.json());

// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

// ----------------------------------------------------
// AUTH ROUTES
// ----------------------------------------------------

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ message: 'Username already exists' });
                }
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, username: user.username } });
    });
});

// ----------------------------------------------------
// MATCH ROUTES
// ----------------------------------------------------

app.get('/api/matches', (req, res) => {
    db.all(`SELECT * FROM matches ORDER BY date ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/matches/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM matches WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!row) return res.status(404).json({ message: 'Match not found' });
        res.json(row);
    });
});

// ----------------------------------------------------
// BOOKING ROUTES
// ----------------------------------------------------

app.post('/api/bookings', authenticateJWT, (req, res) => {
    const { match_id, tickets_booked } = req.body;
    const user_id = req.user.id;

    if (!match_id || !tickets_booked || tickets_booked <= 0) {
        return res.status(400).json({ message: 'Invalid booking details' });
    }

    db.serialize(() => {
        db.get(`SELECT * FROM matches WHERE id = ?`, [match_id], (err, match) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (!match) return res.status(404).json({ message: 'Match not found' });

            if (match.available_tickets < tickets_booked) {
                return res.status(400).json({ message: 'Not enough tickets available' });
            }

            const total_cost = match.ticket_price * tickets_booked;
            const booking_date = new Date().toISOString();

            db.run("BEGIN TRANSACTION");

            db.run(`UPDATE matches SET available_tickets = available_tickets - ? WHERE id = ? AND available_tickets >= ?`,
                [tickets_booked, match_id, tickets_booked], function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ message: 'Booking failed (update)' });
                }
                if (this.changes === 0) {
                    db.run("ROLLBACK");
                    return res.status(400).json({ message: 'Tickets no longer available' });
                }

                db.run(`INSERT INTO bookings (user_id, match_id, tickets_booked, total_cost, booking_date) VALUES (?, ?, ?, ?, ?)`,
                    [user_id, match_id, tickets_booked, total_cost, booking_date], function(err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ message: 'Booking failed (insert)' });
                    }
                    
                    const bookingId = this.lastID;
                    db.run("COMMIT");
                    
                    // Return confirmation
                    res.status(201).json({
                        message: 'Booking successful',
                        booking: {
                            id: bookingId,
                            match: `${match.team1} vs ${match.team2}`,
                            tickets: tickets_booked,
                            total_cost,
                            booking_date
                        }
                    });
                });
            });
        });
    });
});

app.get('/api/bookings', authenticateJWT, (req, res) => {
    const user_id = req.user.id;
    const query = `
        SELECT b.id, b.tickets_booked, b.total_cost, b.booking_date, m.team1, m.team2, m.date, m.venue
        FROM bookings b
        JOIN matches m ON b.match_id = m.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC
    `;
    db.all(query, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
