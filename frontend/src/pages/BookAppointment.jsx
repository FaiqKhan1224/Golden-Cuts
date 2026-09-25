import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const STEPS = ['Service', 'Barber', 'Date', 'Time', 'Confirm'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [service, setService] = useState(null);
  const [barberMode, setBarberMode] = useState('specific'); // specific | any
  const [barber, setBarber] = useState(null);
  const [date, setDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    client.get('/services').then(r => setServices(r.data));
    client.get('/barbers').then(r => setBarbers(r.data));
  }, []);

  useEffect(() => {
    if (step === 2 && service) {
      const targetBarber = barberMode === 'specific' ? barber : barbers[0];
      if (!targetBarber) return;
      client.get(`/barbers/${targetBarber._id}/available-dates`, { params: { duration: service.duration } })
        .then(r => setAvailableDates(r.data));
    }
  }, [step]);

  useEffect(() => {
    if (date && barber && service) {
      client.get(`/barbers/${barber._id}/slots`, { params: { date, duration: service.duration } })
        .then(r => setSlots(r.data.slots));
    }
  }, [date]);

  async function confirmBooking() {
    setLoading(true); setError('');
    try {
      const res = await client.post('/appointments', {
        serviceId: service._id, barberId: barber._id, date, time,
      });
      setSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="container section" style={{ maxWidth: 520 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <h2>Booking Confirmed</h2>
          <p className="text-secondary">{success.service?.name} with {success.barber?.name}</p>
          <p className="gold" style={{ fontSize: 18, fontWeight: 700 }}>{success.date} at {success.time}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <button className="btn btn-outline" onClick={() => navigate('/my-appointments')}>My Appointments</button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <h1 style={{ marginBottom: 8 }}>Book Appointment</h1>
      <div className="tabs">
        {STEPS.map((s, i) => (
          <div key={s} className={`tab ${i === step ? 'active' : ''}`}>{i + 1}. {s}</div>
        ))}
      </div>
      {error && <div className="alert alert-error">{error}</div>}

      {step === 0 && (
        <div className="grid grid-2">
          {services.map(s => (
            <div key={s._id} className="card" style={{ borderColor: service?._id === s._id ? 'var(--gold)' : undefined, cursor: 'pointer' }}
              onClick={() => setService(s)}>
              <h4>{s.name}</h4>
              <p className="text-muted" style={{ fontSize: 13 }}>{s.duration} min</p>
              <p className="gold" style={{ fontWeight: 700 }}>${s.price}</p>
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button className={barberMode === 'specific' ? 'btn btn-primary' : 'btn btn-dark'} onClick={() => setBarberMode('specific')}>Specific Barber</button>
            <button className={barberMode === 'any' ? 'btn btn-primary' : 'btn btn-dark'} onClick={() => { setBarberMode('any'); setBarber(barbers[0]); }}>Any Available Barber</button>
          </div>
          {barberMode === 'specific' && (
            <div className="grid grid-2">
              {barbers.map(b => (
                <div key={b._id} className="card" style={{ borderColor: barber?._id === b._id ? 'var(--gold)' : undefined, cursor: 'pointer' }}
                  onClick={() => setBarber(b)}>
                  <h4>{b.name}</h4>
                  <p className="text-muted" style={{ fontSize: 13 }}>{(b.specialties || []).join(', ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-muted" style={{ marginBottom: 14 }}>Available dates for {barber?.name} (next 14 days):</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {availableDates.map(d => (
              <button key={d.date} className={date === d.date ? 'btn btn-primary btn-sm' : 'btn btn-dark btn-sm'} onClick={() => setDate(d.date)}>
                {d.date}
              </button>
            ))}
            {availableDates.length === 0 && <p className="text-muted">No availability found in the next 14 days.</p>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="text-muted" style={{ marginBottom: 14 }}>Available times on {date}:</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {slots.map(s => (
              <button key={s} className={time === s ? 'btn btn-primary btn-sm' : 'btn btn-dark btn-sm'} onClick={() => setTime(s)}>{s}</button>
            ))}
            {slots.length === 0 && <p className="text-muted">No slots available that day.</p>}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <h4 className="gold">Appointment Summary</h4>
          <p><strong>Service:</strong> {service?.name}</p>
          <p><strong>Barber:</strong> {barber?.name}</p>
          <p><strong>Date:</strong> {date}</p>
          <p><strong>Time:</strong> {time}</p>
          <p><strong>Duration:</strong> {service?.duration} min</p>
          <p><strong>Price:</strong> ${service?.price}</p>
          <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={loading} onClick={confirmBooking}>
            {loading ? 'Confirming…' : 'Confirm Appointment'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
        <button className="btn btn-dark" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</button>
        {step < 4 && (
          <button className="btn btn-primary"
            disabled={
              (step === 0 && !service) ||
              (step === 1 && !barber) ||
              (step === 2 && !date) ||
              (step === 3 && !time)
            }
            onClick={() => setStep(s => s + 1)}>Next</button>
        )}
      </div>
    </div>
  );
}
