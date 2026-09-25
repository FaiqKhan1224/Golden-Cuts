import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { client.get('/admin/dashboard').then(r => setData(r.data)); }, []);
  if (!data) return null;

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Admin Dashboard</h1>
      <div className="grid grid-4" style={{ marginBottom: 40 }}>
        <div className="card stat-card"><div className="stat-icon">📅</div><div><div className="stat-value">{data.todayCount}</div><div className="stat-label">Today's Appointments</div></div></div>
        <div className="card stat-card"><div className="stat-icon">👥</div><div><div className="stat-value">{data.totalCustomers}</div><div className="stat-label">Total Customers</div></div></div>
        <div className="card stat-card"><div className="stat-icon">💰</div><div><div className="stat-value">${data.monthlyRevenue}</div><div className="stat-label">Monthly Revenue</div></div></div>
        <div className="card stat-card"><div className="stat-icon">⏳</div><div><div className="stat-value">{data.pendingCount}</div><div className="stat-label">Pending</div></div></div>
      </div>

      <div className="grid grid-2">
        <div>
          <h3 style={{ marginBottom: 14 }}>Today's Schedule</h3>
          <div className="table-wrap" style={{ marginBottom: 32 }}>
            <table>
              <thead><tr><th>Time</th><th>Customer</th><th>Service</th><th>Barber</th></tr></thead>
              <tbody>
                {data.todaySchedule.map(a => (
                  <tr key={a._id}><td>{a.time}</td><td>{a.user?.firstName} {a.user?.lastName}</td><td>{a.service?.name}</td><td>{a.barber?.name}</td></tr>
                ))}
                {data.todaySchedule.length === 0 && <tr><td colSpan={4} className="text-muted">Nothing scheduled today.</td></tr>}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: 14 }}>Popular Services</h3>
          <div className="table-wrap">
            <table>
              <tbody>
                {data.popularServices.map((p, i) => (
                  <tr key={i}><td>{p.service?.name || 'Unknown'}</td><td className="gold">{p.count} bookings</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: 14 }}>Recent Bookings</h3>
          <div className="table-wrap" style={{ marginBottom: 32 }}>
            <table>
              <thead><tr><th>Customer</th><th>Service</th><th>Status</th></tr></thead>
              <tbody>
                {data.recentBookings.map(a => (
                  <tr key={a._id}><td>{a.user?.firstName} {a.user?.lastName}</td><td>{a.service?.name}</td><td><span className="badge badge-gold">{a.status}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginBottom: 14 }}>Recent Reviews</h3>
          <div className="table-wrap">
            <table>
              <tbody>
                {data.recentReviews.map(r => (
                  <tr key={r._id}><td>{r.user?.firstName}</td><td>{'★'.repeat(r.rating)}</td><td className="text-muted">{r.comment.slice(0, 40)}…</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
