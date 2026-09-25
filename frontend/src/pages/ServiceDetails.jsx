import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

export default function ServiceDetails() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  useEffect(() => { client.get(`/services/${id}`).then(r => setService(r.data)); }, [id]);
  if (!service) return <div className="container section">Loading…</div>;

  return (
    <div className="container section">
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {service.image && <img src={service.image} alt={service.name} style={{ borderRadius: 14, width: '100%' }} />}
        <div>
          <p className="eyebrow">{service.category}</p>
          <h1>{service.name}</h1>
          <p className="text-secondary" style={{ fontSize: 16, margin: '16px 0' }}>{service.description}</p>
          <div style={{ display: 'flex', gap: 30, margin: '20px 0' }}>
            <div><div className="gold" style={{ fontSize: 26, fontWeight: 700 }}>${service.price}</div><div className="text-muted" style={{ fontSize: 13 }}>Price</div></div>
            <div><div style={{ fontSize: 26, fontWeight: 700 }}>{service.duration} min</div><div className="text-muted" style={{ fontSize: 13 }}>Duration</div></div>
          </div>
          <Link to="/book-appointment" className="btn btn-primary">Book Appointment</Link>
        </div>
      </div>
    </div>
  );
}
