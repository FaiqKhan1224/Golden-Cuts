import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    client.get('/appointments/mine').then(r => setAppointments(r.data));
    client.get('/services').then(r => setServices(r.data.slice(0, 3)));
  }, []);

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => ['cancelled', 'no_show'].includes(a.status));
  const next = upcoming[0];

  return (
    <div className="container section">
      <h1>Welcome back, {user?.firstName}</h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>Here's what's happening with your appointments.</p>

      <div className="grid grid-3" style={{ marginBottom: 40 }}>
        <div className="card stat-card"><div className="stat-icon">📅</div><div><div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming</div></div></div>
        <div className="card stat-card"><div className="stat-icon">✅</div><div><div className="stat-value">{completed.length}</div><div className="stat-label">Completed</div></div></div>
        <div className="card stat-card"><div className="stat-icon">✕</div><div><div className="stat-value">{cancelled.length}</div><div className="stat-label">Cancelled</div></div></div>
      </div>

      {next && (
        <div className="card" style={{ marginBottom: 40 }}>
          <h4 className="gold">Next Appointment</h4>
          <p>{next.service?.name} with {next.barber?.name} — {next.date} at {next.time}</p>
        </div>
      )}

      <h3 style={{ marginBottom: 16 }}>Recent Appointments</h3>
      <div className="table-wrap" style={{ marginBottom: 40 }}>
        <table>
          <thead><tr><th>Service</th><th>Barber</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
          <tbody>
            {appointments.slice(0, 5).map(a => (
              <tr key={a._id}>
                <td>{a.service?.name}</td><td>{a.barber?.name}</td><td>{a.date}</td><td>{a.time}</td>
                <td><span className="badge badge-gold">{a.status}</span></td>
              </tr>
            ))}
            {appointments.length === 0 && <tr><td colSpan={5} className="text-muted">No appointments yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginBottom: 16 }}>Recommended Services</h3>
      <div className="grid grid-3" style={{ marginBottom: 32 }}>
        {services.map(s => (
          <div className="card" key={s._id}>
            <h4>{s.name}</h4>
            <p className="gold">${s.price}</p>
          </div>
        ))}
      </div>
      <Link to="/book-appointment" className="btn btn-primary">Book Appointment</Link>
    </div>
  );
}
