const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Initialize schema
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                team1 TEXT NOT NULL,
                team2 TEXT NOT NULL,
                date TEXT NOT NULL,
                venue TEXT NOT NULL,
                ticket_price REAL NOT NULL,
                total_tickets INTEGER NOT NULL,
                available_tickets INTEGER NOT NULL
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                match_id INTEGER NOT NULL,
                tickets_booked INTEGER NOT NULL,
                total_cost REAL NOT NULL,
                booking_date TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (match_id) REFERENCES matches(id)
            )`);

            // Seed initial matches if none exist
            db.get("SELECT COUNT(*) AS count FROM matches", (err, row) => {
                if (err) return console.error(err.message);
                if (row.count === 0) {
                    console.log('Seeding initial cricket matches...');
                    const insert = db.prepare(`INSERT INTO matches (team1, team2, date, venue, ticket_price, total_tickets, available_tickets) VALUES (?, ?, ?, ?, ?, ?, ?)`);
                    insert.run('India', 'Australia', '2026-10-15 14:00', 'Wankhede Stadium, Mumbai', 2500, 30000, 30000);
                    insert.run('England', 'New Zealand', '2026-10-18 10:00', "Lord's, London", 3000, 25000, 25000);
                    insert.run('South Africa', 'Pakistan', '2026-10-22 18:00', 'Wanderers Stadium, Johannesburg', 1800, 20000, 20000);
                    insert.run('India', 'Pakistan', '2026-11-05 14:00', 'Narendra Modi Stadium, Ahmedabad', 5000, 100000, 100000);
                    insert.finalize();
                }
            });
        });
    }
});

module.exports = db;
