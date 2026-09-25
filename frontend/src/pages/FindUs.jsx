import { useEffect, useState } from 'react';
import client from '../api/client';

export default function FindUs() {
  const [business, setBusiness] = useState(null);
  useEffect(() => { client.get('/business').then(r => setBusiness(r.data)); }, []);
  if (!business) return null;

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(business.address)}&output=embed`;

  return (
    <div className="container section">
      <p className="eyebrow">Find Us</p>
      <h1 style={{ marginBottom: 32 }}>{business.businessName}</h1>
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h4 className="gold">📍 Address</h4>
          <p className="text-secondary">{business.address}</p>
          <a className="btn btn-outline btn-sm" style={{ marginTop: 10 }}
             href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`} target="_blank" rel="noreferrer">Get Directions</a>

          <h4 className="gold" style={{ marginTop: 24 }}>📞 Phone</h4>
          <p className="text-secondary">{business.phone}</p>

          <h4 className="gold" style={{ marginTop: 24 }}>✉️ Email</h4>
          <p className="text-secondary">{business.email}</p>

          <h4 className="gold" style={{ marginTop: 24 }}>🕒 Opening Hours</h4>
          <p className="text-secondary">{business.openingHours}</p>
        </div>
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', height: 380 }}>
          <iframe title="map" width="100%" height="100%" style={{ border: 0 }} src={mapSrc} loading="lazy"></iframe>
        </div>
      </div>
    </div>
  );
}
