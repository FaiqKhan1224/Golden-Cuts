import { useEffect, useState } from 'react';
import client from '../../api/client';

const DAY_KEYS = ['sun','mon','tue','wed','thu','fri','sat'];
const DAY_LABELS = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };

function defaultWorkingHours() {
  return DAY_KEYS.map(day => ({ day, isOff: false, start: '09:00', end: '23:30', breakStart: '', breakEnd: '' }));
}

const EMPTY = {
  name: '', image: '', title: '', bio: '', specialties: '', experience: 0, rating: 5,
  workingHours: defaultWorkingHours(), active: true,
};

export default function AdminBarbers() {
  const [barbers, setBarbers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  function load() { client.get('/barbers?all=true').then(r => setBarbers(r.data)); }
  useEffect(load, []);

  function openNew() { setForm(EMPTY); setEditing('new'); }
  function openEdit(b) {
    setForm({ ...b, specialties: (b.specialties || []).join(', '), workingHours: b.workingHours?.length ? b.workingHours : defaultWorkingHours() });
    setEditing(b._id);
  }

  function updateDay(day, field, value) {
    setForm(f => ({ ...f, workingHours: f.workingHours.map(w => w.day === day ? { ...w, [field]: value } : w) }));
  }

  async function save() {
    const payload = { ...form, specialties: form.specialties.split(',').map(s => s.trim()).filter(Boolean) };
    if (editing === 'new') await client.post('/barbers', payload);
    else await client.put(`/barbers/${editing}`, payload);
    setEditing(null); load();
  }
  async function remove(id) {
    if (!confirm('Delete this barber?')) return;
    await client.delete(`/barbers/${id}`); load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Barbers</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Add Barber</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Title</th><th>Specialties</th><th>Experience</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {barbers.map(b => (
              <tr key={b._id}>
                <td>{b.name}</td><td>{b.title}</td><td>{(b.specialties || []).join(', ')}</td>
                <td>{b.experience} yrs</td><td>⭐ {b.rating}</td>
                <td><span className={`badge ${b.active ? 'badge-success' : 'badge-muted'}`}>{b.active ? 'Active' : 'Inactive'}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-dark btn-sm" onClick={() => openEdit(b)}>Edit</button>
                  <button className="btn btn-dark btn-sm" onClick={() => remove(b._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <h4>{editing === 'new' ? 'Add Barber' : 'Edit Barber'}</h4>
            <div className="grid grid-2">
              <div className="field"><label>Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Title</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            </div>
            <div className="field"><label>Photo URL</label><input className="input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></div>
            <div className="field"><label>Bio</label><textarea className="input" rows={2} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
            <div className="field"><label>Specialties (comma-separated)</label><input className="input" value={form.specialties} onChange={e => setForm({ ...form, specialties: e.target.value })} /></div>
            <div className="grid grid-2">
              <div className="field"><label>Experience (years)</label><input className="input" type="number" value={form.experience} onChange={e => setForm({ ...form, experience: Number(e.target.value) })} /></div>
              <div className="field"><label>Rating</label><input className="input" type="number" step="0.1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} /></div>
            </div>

            <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Working Hours & Breaks</label>
            <div className="table-wrap" style={{ margin: '8px 0 16px' }}>
              <table>
                <thead><tr><th>Day</th><th>Off</th><th>Start</th><th>End</th><th>Break</th></tr></thead>
                <tbody>
                  {form.workingHours.map(w => (
                    <tr key={w.day}>
                      <td>{DAY_LABELS[w.day]}</td>
                      <td><input type="checkbox" checked={w.isOff} onChange={e => updateDay(w.day, 'isOff', e.target.checked)} /></td>
                      <td><input className="input" style={{ padding: 6 }} type="time" value={w.start} onChange={e => updateDay(w.day, 'start', e.target.value)} disabled={w.isOff} /></td>
                      <td><input className="input" style={{ padding: 6 }} type="time" value={w.end} onChange={e => updateDay(w.day, 'end', e.target.value)} disabled={w.isOff} /></td>
                      <td style={{ display: 'flex', gap: 4 }}>
                        <input className="input" style={{ padding: 6, width: 90 }} type="time" value={w.breakStart} onChange={e => updateDay(w.day, 'breakStart', e.target.value)} disabled={w.isOff} />
                        <input className="input" style={{ padding: 6, width: 90 }} type="time" value={w.breakEnd} onChange={e => updateDay(w.day, 'breakEnd', e.target.value)} disabled={w.isOff} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="field"><label><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active (visible for booking & AI)</label></div>
            <button className="btn btn-primary btn-block" onClick={save}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
