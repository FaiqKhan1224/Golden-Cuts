import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await client.post('/auth/signup', form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 460 }}>
      <div className="card">
        <h2 style={{ textAlign: 'center' }}>Create Account</h2>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: 24 }}>Join Golden Cuts today</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="grid grid-2">
            <div className="field"><label>First Name</label><input className="input" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="field"><label>Last Name</label><input className="input" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
          </div>
          <div className="field"><label>Email</label><input className="input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field"><label>Phone</label><input className="input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="field">
            <label>Password</label>
            <div className="password-field">
              <input className="input" type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="password-toggle" onClick={() => setShowPw(s => !s)}>{showPw ? 'HIDE' : 'SHOW'}</button>
            </div>
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <div className="password-field">
              <input className="input" type={showPw2 ? 'text' : 'password'} required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
              <button type="button" className="password-toggle" onClick={() => setShowPw2(s => !s)}>{showPw2 ? 'HIDE' : 'SHOW'}</button>
            </div>
          </div>
          <button className="btn btn-primary btn-block" type="submit">Create Account</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16 }} className="text-muted">Already have an account? <Link to="/login" className="gold">Login</Link></p>
      </div>
    </div>
  );
}
