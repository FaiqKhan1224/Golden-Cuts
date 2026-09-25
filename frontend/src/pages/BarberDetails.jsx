import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';

const DAY_LABELS = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };

export default function BarberDetails() {
  const { id } = useParams();
  const [barber, setBarber] = useState(null);
  useEffect(() => { client.get(`/barbers/${id}`).then(r => setBarber(r.data)); }, [id]);
  if (!barber) return <div className="container section">Loading…</div>;

  return (
    <div className="container section">
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {barber.image && <img src={barber.image} alt={barber.name} style={{ borderRadius: 14, width: '100%' }} />}
        <div>
          <h1>{barber.name}</h1>
          <p className="gold" style={{ marginBottom: 12 }}>{barber.title}</p>
          <p className="text-secondary" style={{ marginBottom: 16 }}>{barber.bio}</p>
          <p style={{ marginBottom: 6 }}><strong>Specialties:</strong> {(barber.specialties || []).join(', ')}</p>
          <p style={{ marginBottom: 6 }}><strong>Experience:</strong> {barber.experience} years</p>
          <p style={{ marginBottom: 20 }}><strong>Rating:</strong> ⭐ {barber.rating}/5</p>

          <h4 className="gold" style={{ fontSize: 15 }}>Availability</h4>
          <div className="table-wrap" style={{ marginBottom: 24 }}>
            <table>
              <tbody>
                {barber.workingHours?.map(w => (
                  <tr key={w.day}>
                    <td>{DAY_LABELS[w.day]}</td>
                    <td>{w.isOff ? <span className="badge badge-muted">Day Off</span> : `${w.start} – ${w.end}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link to="/book-appointment" className="btn btn-primary">Book With This Barber</Link>
        </div>
      </div>
    </div>
  );
}
