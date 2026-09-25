import { useEffect, useState } from 'react';
import client from '../../api/client';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({ status: '', barber: '', service: '', date: '', customer: '' });
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);

  function load() {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    client.get('/appointments', { params }).then(r => setAppointments(r.data));
  }
  useEffect(load, [filters]);
  useEffect(() => {
    client.get('/barbers?all=true').then(r => setBarbers(r.data));
    client.get('/services?all=true').then(r => setServices(r.data));
  }, []);

  async function setStatus(id, status) {
    await client.put(`/appointments/${id}/status`, { status });
    load();
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Appointments</h1>
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <select className="input" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={filters.barber} onChange={e => setFilters({ ...filters, barber: e.target.value })}>
          <option value="">All Barbers</option>
          {barbers.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
        </select>
        <select className="input" value={filters.service} onChange={e => setFilters({ ...filters, service: e.target.value })}>
          <option value="">All Services</option>
          {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <input className="input" type="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} />
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Booking ID</th><th>Customer</th><th>Service</th><th>Barber</th><th>Date</th><th>Time</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a._id}>
                <td className="text-muted">{a._id.slice(-6)}</td>
                <td>{a.user?.firstName} {a.user?.lastName}</td>
                <td>{a.service?.name}</td><td>{a.barber?.name}</td><td>{a.date}</td><td>{a.time}</td>
                <td>${a.price}</td>
                <td><span className="badge badge-gold">{a.status}</span></td>
                <td>
                  <select className="input" style={{ padding: '6px 8px', fontSize: 12 }} value={a.status} onChange={e => setStatus(a._id, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && <tr><td colSpan={9} className="text-muted">No appointments match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
