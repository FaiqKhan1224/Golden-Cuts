import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  function load() { client.get('/contact').then(r => setMessages(r.data)); }
  useEffect(load, []);

  async function markRead(id) { await client.put(`/contact/${id}/read`); load(); }
  async function remove(id) {
    if (!confirm('Delete this message?')) return;
    await client.delete(`/contact/${id}`); load();
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Messages</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {messages.map(m => (
              <tr key={m._id}>
                <td>{m.name}</td><td>{m.email}</td><td>{m.subject}</td>
                <td style={{ maxWidth: 280 }}>{m.message}</td>
                <td><span className={`badge ${m.read ? 'badge-muted' : 'badge-gold'}`}>{m.read ? 'Read' : 'New'}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  {!m.read && <button className="btn btn-dark btn-sm" onClick={() => markRead(m._id)}>Mark Read</button>}
                  <button className="btn btn-dark btn-sm" onClick={() => remove(m._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
