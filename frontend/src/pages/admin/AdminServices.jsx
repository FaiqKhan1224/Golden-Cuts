import { useEffect, useState } from 'react';
import client from '../../api/client';

const EMPTY = { name: '', description: '', price: '', duration: '', image: '', category: '', active: true };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  function load() { client.get('/services?all=true').then(r => setServices(r.data)); }
  useEffect(load, []);

  function openNew() { setForm(EMPTY); setEditing('new'); }
  function openEdit(s) { setForm(s); setEditing(s._id); }

  async function save() {
    if (editing === 'new') await client.post('/services', form);
    else await client.put(`/services/${editing}`, form);
    setEditing(null); load();
  }
  async function remove(id) {
    if (!confirm('Delete this service?')) return;
    await client.delete(`/services/${id}`); load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Services</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Add Service</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Price</th><th>Duration</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {services.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td><td className="gold">${s.price}</td><td>{s.duration} min</td><td>{s.category}</td>
                <td><span className={`badge ${s.active ? 'badge-success' : 'badge-muted'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-dark btn-sm" onClick={() => openEdit(s)}>Edit</button>
                  <button className="btn btn-dark btn-sm" onClick={() => remove(s._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>{editing === 'new' ? 'Add Service' : 'Edit Service'}</h4>
            <div className="field"><label>Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="field"><label>Description</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-2">
              <div className="field"><label>Price ($)</label><input className="input" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div className="field"><label>Duration (min)</label><input className="input" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} /></div>
            </div>
            <div className="field"><label>Image URL</label><input className="input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></div>
            <div className="field"><label>Category</label><input className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
            <div className="field">
              <label><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active</label>
            </div>
            <button className="btn btn-primary btn-block" onClick={save}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
