import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';

export default function BookTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [tickets, setTickets] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await api.get(`/matches/${id}`);
        setMatch(res.data);
      } catch (err) {
        setError('Failed to load match details');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  const handleBook = async () => {
    setBooking(true);
    setError('');
    try {
      const res = await api.post('/bookings', {
        match_id: parseInt(id),
        tickets_booked: tickets
      });
      // Pass the booking response to confirmation page
      navigate('/bookings/confirmation', { state: { booking: res.data.booking } });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loader-container"><span className="loader"></span></div>;
  if (!match) return <div className="error-msg">Match not found</div>;

  const totalCost = match.ticket_price * tickets;

  return (
    <div>
      <h1 className="page-title">Complete Your Booking</h1>
      <div className="booking-form-wrapper">
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem' }}>Match Details</h2>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary-accent)' }}>
            {match.team1} vs {match.team2}
          </div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Date: {new Date(match.date).toLocaleString()}</p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Venue: {match.venue}</p>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <span className="badge badge-success">Available Tickets: {match.available_tickets}</span>
          </div>

          <div className="input-group">
            <label>Number of Tickets</label>
            <input 
              type="number" 
              className="input-field" 
              min="1" 
              max={Math.min(10, match.available_tickets)}
              value={tickets}
              onChange={(e) => setTickets(parseInt(e.target.value) || 1)}
            />
            <small style={{ color: 'var(--text-muted)' }}>Maximum 10 tickets per booking</small>
          </div>
        </div>

        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Order Summary</h2>
          {error && <div className="error-msg"><AlertCircle size={16} style={{display:'inline', marginRight:'8px'}}/> {error}</div>}
          
          <div className="summary-box">
            <div className="summary-row">
              <span>Ticket Price (x{tickets})</span>
              <span>₹{match.ticket_price}</span>
            </div>
            <div className="summary-row">
              <span>Convenience Fee</span>
              <span>₹0</span>
            </div>
            <div className="summary-row">
              <span>Total Amount</span>
              <span>₹{totalCost}</span>
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem' }}
            onClick={handleBook}
            disabled={booking || tickets > match.available_tickets || tickets < 1}
          >
            {booking ? 'Processing...' : <><CreditCard size={20} /> Pay ₹{totalCost} & Book</>}
          </button>
        </div>
      </div>
    </div>
  );
}
