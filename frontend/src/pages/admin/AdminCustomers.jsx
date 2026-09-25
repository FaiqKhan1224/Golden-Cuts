import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  function load() { client.get('/admin/customers').then(r => setCustomers(r.data)); }
  useEffect(load, []);

  async function toggleStatus(c) {
    const status = c.status === 'active' ? 'suspended' : 'active';
    await client.put(`/admin/customers/${c._id}/status`, { status });
    load();
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Customers</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Total Appts</th><th>Last Appt</th><th>Status</th><th>Registered</th><th>Actions</th></tr></thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id}>
                <td>{c.firstName} {c.lastName}</td><td>{c.email}</td><td>{c.phone}</td>
                <td>{c.totalAppointments}</td><td>{c.lastAppointment || '—'}</td>
                <td><span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-error'}`}>{c.status}</span></td>
                <td className="text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td><button className="btn btn-dark btn-sm" onClick={() => toggleStatus(c)}>{c.status === 'active' ? 'Suspend' : 'Activate'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
