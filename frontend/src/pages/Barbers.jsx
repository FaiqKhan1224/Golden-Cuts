import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function Barbers() {
  const [barbers, setBarbers] = useState([]);
  useEffect(() => { client.get('/barbers').then(r => setBarbers(r.data)); }, []);

  return (
    <div className="container section">
      <p className="eyebrow">Barbers</p>
      <h1 style={{ marginBottom: 6 }}>Meet Our Barbers</h1>
      <p className="text-muted" style={{ marginBottom: 32 }}>Skilled hands. Real expertise.</p>
      <div className="grid grid-3">
        {barbers.map(b => (
          <div className="card" key={b._id}>
            {b.image && <img src={b.image} alt={b.name} style={{ borderRadius: 10, height: 200, objectFit: 'cover', width: '100%', marginBottom: 14 }} />}
            <h4>{b.name}</h4>
            <p className="text-muted" style={{ fontSize: 13 }}>{b.title}</p>
            <p className="gold" style={{ fontSize: 13, margin: '6px 0' }}>{(b.specialties || []).join(', ')}</p>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>{b.experience} yrs experience · ⭐ {b.rating}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/barbers/${b._id}`} className="btn btn-dark btn-sm" style={{ flex: 1 }}>View Profile</Link>
              <Link to="/book-appointment" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Book</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
