import { useEffect, useState } from 'react';
import client from '../../api/client';

const CATEGORIES = ['Haircuts', 'Fades', 'Beards', 'Styling', 'Shop'];
const EMPTY = { image: '', category: 'Haircuts', caption: '', featured: false, active: true };

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  function load() { client.get('/gallery?all=true').then(r => setImages(r.data)); }
  useEffect(load, []);

  function openNew() { setForm(EMPTY); setEditing('new'); }
  function openEdit(g) { setForm(g); setEditing(g._id); }

  async function save() {
    if (editing === 'new') await client.post('/gallery', form);
    else await client.put(`/gallery/${editing}`, form);
    setEditing(null); load();
  }
  async function remove(id) {
    if (!confirm('Delete this image?')) return;
    await client.delete(`/gallery/${id}`); load();
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Gallery</h1>
        <button className="btn btn-primary" onClick={openNew}>+ Add Image</button>
      </div>

      <div className="grid grid-4">
        {images.map(g => (
          <div className="card" key={g._id}>
            <img src={g.image} alt={g.caption} style={{ borderRadius: 8, height: 120, width: '100%', objectFit: 'cover', marginBottom: 10 }} />
            <p style={{ fontSize: 13 }}>{g.caption}</p>
            <p className="text-muted" style={{ fontSize: 12 }}>{g.category} {g.featured && '· Featured'}</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button className="btn btn-dark btn-sm" style={{ flex: 1 }} onClick={() => openEdit(g)}>Edit</button>
              <button className="btn btn-dark btn-sm" style={{ flex: 1 }} onClick={() => remove(g._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h4>{editing === 'new' ? 'Add Image' : 'Edit Image'}</h4>
            <div className="field"><label>Image URL</label><input className="input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></div>
            <div className="field"><label>Caption</label><input className="input" value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} /></div>
            <div className="field">
              <label>Category</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field"><label><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Featured</label></div>
            <div className="field"><label><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active</label></div>
            <button className="btn btn-primary btn-block" onClick={save}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
