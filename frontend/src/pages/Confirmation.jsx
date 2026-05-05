import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { CheckCircle, Home, Download } from 'lucide-react';

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  if (!booking) {
    return <Navigate to="/matches" />;
  }

  return (
    <div className="center-wrapper">
      <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--success)' }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your tickets have been successfully booked.</p>

        <div className="summary-box" style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <div className="summary-row">
            <span style={{ color: 'var(--text-muted)' }}>Booking ID</span>
            <span style={{ fontWeight: 'bold' }}>#BKG-{booking.id.toString().padStart(6, '0')}</span>
          </div>
          <div className="summary-row">
            <span style={{ color: 'var(--text-muted)' }}>Match</span>
            <span style={{ fontWeight: 'bold', color: 'var(--primary-accent)' }}>{booking.match}</span>
          </div>
          <div className="summary-row">
            <span style={{ color: 'var(--text-muted)' }}>Tickets Booked</span>
            <span style={{ fontWeight: 'bold' }}>{booking.tickets}</span>
          </div>
          <div className="summary-row">
            <span style={{ color: 'var(--text-muted)' }}>Date of Booking</span>
            <span>{new Date(booking.booking_date).toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span style={{ color: 'var(--text-muted)' }}>Total Amount Paid</span>
            <span style={{ fontSize: '1.2rem' }}>₹{booking.total_cost}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={() => window.print()}>
            <Download size={18} style={{ marginRight: '8px' }} /> Download Ticket
          </button>
          <button className="btn-primary" onClick={() => navigate('/matches')}>
            <Home size={18} style={{ marginRight: '8px' }} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
