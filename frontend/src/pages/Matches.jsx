import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react';
import api from '../api';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/matches');
        setMatches(res.data);
      } catch (err) {
        console.error('Failed to fetch matches', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <span className="loader"></span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Upcoming Cricket Matches</h1>
      <div className="matches-grid">
        {matches.map(match => (
          <div key={match.id} className="glass-panel match-card">
            <div className="match-teams">
              <span>{match.team1}</span>
              <span className="match-vs">VS</span>
              <span>{match.team2}</span>
            </div>
            
            <div className="match-details-list">
              <div className="match-detail-item">
                <Calendar size={18} className="match-detail-icon" />
                <span>{new Date(match.date).toLocaleString()}</span>
              </div>
              <div className="match-detail-item">
                <MapPin size={18} className="match-detail-icon" />
                <span>{match.venue}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Price starts at</div>
                <div className="price-tag">₹{match.ticket_price}</div>
              </div>
              <button 
                className="btn-primary" 
                onClick={() => navigate(`/matches/${match.id}/book`)}
                disabled={match.available_tickets === 0}
              >
                {match.available_tickets > 0 ? <><TicketIcon size={18} /> Book Now</> : 'Sold Out'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
