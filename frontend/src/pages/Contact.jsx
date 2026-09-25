import { useEffect, useState } from 'react';
import client from '../api/client';

export default function Contact() {
  const [business, setBusiness] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState(null);

  useEffect(() => { client.get('/business').then(r => setBusiness(r.data)); }, []);

  async function submit(e) {
    e.preventDefault();
    setStatus(null);
    try {
      await client.post('/contact', form);
      setStatus({ type: 'success', text: 'Message sent! We will get back to you shortly.' });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || 'Something went wrong.' });
    }
  }

  return (
    <div className="container section">
      <p className="eyebrow">Contact</p>
      <h1 style={{ marginBottom: 32 }}>Get In Touch</h1>
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <form className="card" onSubmit={submit}>
          {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}
          <div className="field"><label>Name</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Email</label><input className="input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="field"><label>Subject</label><input className="input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
          <div className="field"><label>Message</label><textarea className="input" rows={5} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></div>
          <button className="btn btn-primary btn-block" type="submit">Send Message</button>
        </form>
        {business && (
          <div className="card">
            <h4 className="gold">Address</h4>
            <p className="text-secondary">{business.address}</p>
            <h4 className="gold" style={{ marginTop: 20 }}>Opening Hours</h4>
            <p className="text-secondary">{business.openingHours}</p>
          </div>
        )}
      </div>
    </div>
  );
}
