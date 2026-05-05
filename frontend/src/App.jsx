import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Matches from './pages/Matches';
import BookTicket from './pages/BookTicket';
import Confirmation from './pages/Confirmation';
import Chatbot from './components/Chatbot';
import { LogOut, Ticket } from 'lucide-react';

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Ticket className="text-primary-accent" size={28} color="#00d2ff" />
          CricTickets
        </div>
        <div className="navbar-nav">
          {token ? (
            <>
              <span style={{ color: 'var(--text-muted)' }}>Hello, {user?.username}</span>
              <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-secondary">Login</button>
              <button onClick={() => navigate('/register')} className="btn-primary">Sign Up</button>
            </>
          )}
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to={token ? "/matches" : "/login"} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/matches" element={token ? <Matches /> : <Navigate to="/login" />} />
          <Route path="/matches/:id/book" element={token ? <BookTicket /> : <Navigate to="/login" />} />
          <Route path="/bookings/confirmation" element={token ? <Confirmation /> : <Navigate to="/login" />} />
        </Routes>
      </div>
      <Chatbot />
    </>
  );
}

export default App;
