import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function Home() {
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    client.get('/services').then(r => setServices(r.data.slice(0, 4)));
    client.get('/barbers').then(r => setBarbers(r.data.slice(0, 4)));
    client.get('/gallery').then(r => setGallery(r.data.slice(0, 6)));
    client.get('/reviews').then(r => setReviews(r.data.slice(0, 3)));
    client.get('/business').then(r => setBusiness(r.data));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section style={{
        position: 'relative', minHeight: '86vh', display: 'flex', alignItems: 'center',
        backgroundImage: `linear-gradient(180deg, rgba(8,10,12,0.55), rgba(8,10,12,0.92)), url(${business?.heroImage || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&q=80'})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div className="container">
          <p className="eyebrow">Premium Grooming</p>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', lineHeight: 1.08, maxWidth: 720 }}>
            LOOK SHARP.<br /><span className="gold">FEEL CONFIDENT.</span>
          </h1>
          <p className="text-secondary" style={{ fontSize: 18, maxWidth: 520, margin: '20px 0 32px' }}>
            Expert cuts, precision grooming, and premium barbering crafted for you.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/book-appointment" className="btn btn-primary">Book Appointment</Link>
            <Link to="/services" className="btn btn-outline">Explore Services</Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <div className="container grid grid-4">
          {[['✂️','Expert Barbers'], ['🥇','Premium Products'], ['⚡','Modern Techniques'], ['🎯','Personalized Service']].map(([icon, title]) => (
            <div className="card" key={title}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
              <h4>{title}</h4>
              <p className="text-muted" style={{ fontSize: 14 }}>Delivered with precision, every visit.</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="section section-alt">
        <div className="container">
          <p className="eyebrow">Featured Services</p>
          <h2 style={{ marginBottom: 32 }}>Crafted For Every Look</h2>
          <div className="grid grid-4">
            {services.map(s => (
              <div className="card" key={s._id}>
                {s.image && <img src={s.image} alt={s.name} style={{ borderRadius: 10, height: 140, objectFit: 'cover', width: '100%', marginBottom: 14 }} />}
                <h4>{s.name}</h4>
                <p className="text-muted" style={{ fontSize: 13, minHeight: 40 }}>{s.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0 16px' }}>
                  <span className="gold" style={{ fontWeight: 700 }}>${s.price}</span>
                  <span className="text-muted" style={{ fontSize: 13 }}>{s.duration} min</span>
                </div>
                <Link to="/book-appointment" className="btn btn-outline btn-block btn-sm">Book Now</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BARBERS */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Featured Barbers</p>
          <h2 style={{ marginBottom: 32 }}>Skilled Hands, Real Expertise</h2>
          <div className="grid grid-4">
            {barbers.map(b => (
              <div className="card" key={b._id}>
                {b.image && <img src={b.image} alt={b.name} style={{ borderRadius: 10, height: 160, objectFit: 'cover', width: '100%', marginBottom: 14 }} />}
                <h4>{b.name}</h4>
                <p className="gold" style={{ fontSize: 13, margin: '2px 0 6px' }}>{(b.specialties || []).join(', ')}</p>
                <p className="text-muted" style={{ fontSize: 13 }}>{b.experience} yrs · ⭐ {b.rating}</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <Link to={`/barbers/${b._id}`} className="btn btn-dark btn-sm" style={{ flex: 1 }}>Profile</Link>
                  <Link to="/book-appointment" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Book</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section section-alt">
        <div className="container">
          <p className="eyebrow">Our Work</p>
          <h2 style={{ marginBottom: 32 }}>Styles. Fades. Beards. Masterpieces.</h2>
          <div className="grid grid-3">
            {gallery.map(g => (
              <img key={g._id} src={g.image} alt={g.caption} style={{ borderRadius: 12, height: 220, objectFit: 'cover', width: '100%', border: '1px solid var(--border)' }} />
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link to="/gallery" className="btn btn-outline">View Gallery</Link>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Reviews</p>
          <h2 style={{ marginBottom: 32 }}>What Our Clients Say</h2>
          <div className="grid grid-3">
            {reviews.map(r => (
              <div className="card" key={r._id}>
                <div className="gold" style={{ marginBottom: 8 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p className="text-secondary" style={{ fontSize: 14, marginBottom: 14 }}>"{r.comment}"</p>
                <p style={{ fontWeight: 600, fontSize: 14 }}>{r.user?.firstName} {r.user?.lastName}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
