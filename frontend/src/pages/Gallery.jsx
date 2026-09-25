import { useEffect, useState } from 'react';
import client from '../api/client';

const CATEGORIES = ['All', 'Haircuts', 'Fades', 'Beards', 'Styling', 'Shop'];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('All');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    client.get('/gallery', { params: { category } }).then(r => setImages(r.data));
  }, [category]);

  return (
    <div className="container section">
      <p className="eyebrow">Our Work</p>
      <h1 style={{ marginBottom: 6 }}>Gallery</h1>
      <p className="text-muted" style={{ marginBottom: 24 }}>Styles. Fades. Beards. Masterpieces.</p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={c === category ? 'btn btn-primary btn-sm' : 'btn btn-dark btn-sm'}>{c}</button>
        ))}
      </div>

      <div className="grid grid-3">
        {images.map(g => (
          <img key={g._id} src={g.image} alt={g.caption} onClick={() => setPreview(g)}
            style={{ borderRadius: 12, height: 220, objectFit: 'cover', width: '100%', border: '1px solid var(--border)', cursor: 'pointer' }} />
        ))}
      </div>

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 800, width: '100%' }}>
            <img src={preview.image} alt={preview.caption} style={{ borderRadius: 12, width: '100%' }} />
            <p className="text-secondary" style={{ marginTop: 10 }}>{preview.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
