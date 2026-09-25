import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function Services() {
  const [services, setServices] = useState([]);
  useEffect(() => { client.get('/services').then(r => setServices(r.data)); }, []);

  return (
    <div className="container section">
      <p className="eyebrow">Services</p>
      <h1 style={{ marginBottom: 32 }}>Our Services</h1>
      <div className="grid grid-3">
        {services.map(s => (
          <div className="card" key={s._id}>
            {s.image && <img src={s.image} alt={s.name} style={{ borderRadius: 10, height: 160, objectFit: 'cover', width: '100%', marginBottom: 14 }} />}
            <h4>{s.name}</h4>
            <p className="text-muted" style={{ fontSize: 14, minHeight: 42 }}>{s.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '12px 0 16px' }}>
              <span className="gold" style={{ fontWeight: 700, fontSize: 18 }}>${s.price}</span>
              <span className="text-muted" style={{ fontSize: 13 }}>{s.duration} min</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/services/${s._id}`} className="btn btn-dark btn-sm" style={{ flex: 1 }}>Details</Link>
              <Link to="/book-appointment" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Book Now</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
