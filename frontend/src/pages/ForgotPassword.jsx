import { useState } from 'react';
import client from '../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [devLink, setDevLink] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await client.post('/auth/forgot-password', { email });
      setStatus({ type: 'success', text: res.data.message });
      if (res.data.devResetToken) setDevLink(`/reset-password/${res.data.devResetToken}`);
    } catch (err) {
      setStatus({ type: 'error', text: err.response?.data?.message || 'Something went wrong' });
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 440 }}>
      <div className="card">
        <h2 style={{ textAlign: 'center' }}>Forgot Password</h2>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: 24 }}>We'll send you a reset link</p>
        {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}
        {devLink && (
          <div className="alert alert-success">
            Dev mode (no email service configured): <a className="gold" href={devLink}>Click here to reset your password</a>
          </div>
        )}
        <form onSubmit={submit}>
          <div className="field"><label>Email</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
          <button className="btn btn-primary btn-block" type="submit">Send Reset Link</button>
        </form>
      </div>
    </div>
  );
}
