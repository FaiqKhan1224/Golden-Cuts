import { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => { client.get('/business').then(r => setForm(r.data)); }, []);
  if (!form) return null;

  async function save(e) {
    e.preventDefault();
    try {
      const res = await client.put('/business', form);
      setForm(res.data);
      setMsg({ type: 'success', text: 'Settings saved' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to save settings' });
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ marginBottom: 24 }}>Settings</h1>
      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      <form className="card" onSubmit={save}>
        <div className="field"><label>Business Name</label><input className="input" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} /></div>
        <div className="field"><label>Address</label><input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
        <div className="grid grid-2">
          <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="field"><label>Email</label><input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        </div>
        <div className="field"><label>Opening Hours (display text)</label><input className="input" value={form.openingHours} onChange={e => setForm({ ...form, openingHours: e.target.value })} /></div>
        <div className="grid grid-2">
          <div className="field"><label>Open Time (24h)</label><input className="input" type="time" value={form.openTime} onChange={e => setForm({ ...form, openTime: e.target.value })} /></div>
          <div className="field"><label>Close Time (24h)</label><input className="input" type="time" value={form.closeTime} onChange={e => setForm({ ...form, closeTime: e.target.value })} /></div>
        </div>
        <div className="field"><label>Hero Image URL</label><input className="input" value={form.heroImage} onChange={e => setForm({ ...form, heroImage: e.target.value })} /></div>
        <div className="field"><label>Logo URL</label><input className="input" value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} /></div>
        <div className="field"><label>Description</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <button className="btn btn-primary" type="submit">Save Settings</button>
      </form>
    </div>
  );
}
