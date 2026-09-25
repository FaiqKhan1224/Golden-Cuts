import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await client.post(`/auth/reset-password/${token}`, form);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 440 }}>
      <div className="card">
        <h2 style={{ textAlign: 'center' }}>Reset Password</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Password reset! Redirecting to login…</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>New Password</label>
            <div className="password-field">
              <input className="input" type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="password-toggle" onClick={() => setShowPw(s => !s)}>{showPw ? 'HIDE' : 'SHOW'}</button>
            </div>
          </div>
          <div className="field"><label>Confirm Password</label><input className="input" type={showPw ? 'text' : 'password'} required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} /></div>
          <button className="btn btn-primary btn-block" type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
}
