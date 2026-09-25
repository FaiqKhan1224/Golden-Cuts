import { useEffect, useState } from 'react';
import client from '../api/client';

const TABS = ['Upcoming', 'Completed', 'Cancelled'];

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('Upcoming');
  const [rescheduling, setRescheduling] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [newTime, setNewTime] = useState('');
  const [reviewing, setReviewing] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [msg, setMsg] = useState('');

  function load() { client.get('/appointments/mine').then(r => setAppointments(r.data)); }
  useEffect(load, []);

  const filtered = appointments.filter(a => {
    if (tab === 'Upcoming') return ['pending', 'confirmed'].includes(a.status);
    if (tab === 'Completed') return a.status === 'completed';
    return ['cancelled', 'no_show'].includes(a.status);
  });

  async function cancel(id) {
    if (!confirm('Cancel this appointment?')) return;
    await client.put(`/appointments/${id}/cancel`);
    load();
  }

  async function openReschedule(a) {
    setRescheduling(a); setNewDate(''); setNewTime(''); setSlots([]);
  }

  useEffect(() => {
    if (rescheduling && newDate) {
      client.get(`/barbers/${rescheduling.barber._id}/slots`, { params: { date: newDate, duration: rescheduling.duration } })
        .then(r => setSlots(r.data.slots));
    }
  }, [newDate]);

  async function submitReschedule() {
    await client.put(`/appointments/${rescheduling._id}/reschedule`, { date: newDate, time: newTime });
    setRescheduling(null); load();
  }

  async function submitReview() {
    await client.post('/reviews', { appointmentId: reviewing._id, rating, comment: reviewText });
    setMsg('Thanks for your review! It will appear once approved.');
    setReviewing(null); setReviewText(''); setRating(5);
  }

  return (
    <div className="container section">
      <h1 style={{ marginBottom: 24 }}>My Appointments</h1>
      {msg && <div className="alert alert-success">{msg}</div>}
      <div className="tabs">
        {TABS.map(t => <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ cursor: 'pointer' }}>{t}</div>)}
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Service</th><th>Barber</th><th>Date</th><th>Time</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a._id}>
                <td>{a.service?.name}</td><td>{a.barber?.name}</td><td>{a.date}</td><td>{a.time}</td>
                <td>${a.price}</td><td><span className="badge badge-gold">{a.status}</span></td>
                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {tab === 'Upcoming' && <>
                    <button className="btn btn-dark btn-sm" onClick={() => openReschedule(a)}>Reschedule</button>
                    <button className="btn btn-dark btn-sm" onClick={() => cancel(a._id)}>Cancel</button>
                  </>}
                  {tab === 'Completed' && <button className="btn btn-outline btn-sm" onClick={() => setReviewing(a)}>Leave Review</button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="text-muted">No appointments here.</td></tr>}
          </tbody>
        </table>
      </div>

      {rescheduling && (
        <div className="modal-overlay" onClick={() => setRescheduling(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>Reschedule Appointment</h4>
            <div className="field"><label>New Date</label><input type="date" className="input" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
            {slots.length > 0 && (
              <div className="field">
                <label>New Time</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {slots.map(s => <button key={s} className={newTime === s ? 'btn btn-primary btn-sm' : 'btn btn-dark btn-sm'} onClick={() => setNewTime(s)}>{s}</button>)}
                </div>
              </div>
            )}
            <button className="btn btn-primary btn-block" disabled={!newDate || !newTime} onClick={submitReschedule}>Confirm Reschedule</button>
          </div>
        </div>
      )}

      {reviewing && (
        <div className="modal-overlay" onClick={() => setReviewing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>Leave a Review</h4>
            <div className="field">
              <label>Rating</label>
              <select className="input" value={rating} onChange={e => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
            </div>
            <div className="field"><label>Comment</label><textarea className="input" rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} /></div>
            <button className="btn btn-primary btn-block" disabled={!reviewText} onClick={submitReview}>Submit Review</button>
          </div>
        </div>
      )}
    </div>
  );
}
