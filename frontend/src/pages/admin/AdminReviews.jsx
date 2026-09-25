import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  function load() { client.get('/reviews/all').then(r => setReviews(r.data)); }
  useEffect(load, []);

  async function setStatus(id, status) {
    await client.put(`/reviews/${id}/status`, { status });
    load();
  }
  async function remove(id) {
    if (!confirm('Delete this review?')) return;
    await client.delete(`/reviews/${id}`); load();
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Reviews</h1>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Customer</th><th>Rating</th><th>Comment</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r._id}>
                <td>{r.user?.firstName} {r.user?.lastName}</td>
                <td className="gold">{'★'.repeat(r.rating)}</td>
                <td style={{ maxWidth: 320 }}>{r.comment}</td>
                <td><span className="badge badge-gold">{r.status}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-dark btn-sm" onClick={() => setStatus(r._id, 'approved')}>Approve</button>
                  <button className="btn btn-dark btn-sm" onClick={() => setStatus(r._id, 'hidden')}>Hide</button>
                  <button className="btn btn-dark btn-sm" onClick={() => remove(r._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
