import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  }

  async function submit(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const email = form.email.trim().toLowerCase();
      const password = form.password;

      if (!email || !password) {
        setError('Please enter your email and password.');
        setLoading(false);
        return;
      }

      const res = await client.post('/auth/admin-login', {
        email,
        password,
      });

      console.log('Admin login response:', res.data);

      if (!res.data?.token || !res.data?.user) {
        throw new Error('Invalid admin login response from server.');
      }

      if (res.data.user.role !== 'admin') {
        setError('This account does not have administrator access.');
        setLoading(false);
        return;
      }

      login(res.data.token, res.data.user);

      navigate('/admin', {
        replace: true,
      });
    } catch (err) {
      console.error('Admin login error:', err);

      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        setError('Invalid admin email or password.');
      } else if (status === 403) {
        setError('Administrator access has been denied.');
      } else if (status === 500) {
        setError('Server error. Please try again.');
      } else if (message) {
        setError(message);
      } else {
        setError(
          'Unable to connect to Golden Cuts. Please make sure the backend server is running.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '24px',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 400,
        }}
      >
        <h2 style={{ textAlign: 'center' }}>
          <span className="gold">GOLDEN</span> CUTS
        </h2>

        <p
          className="text-muted"
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Administrator Login
        </p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="admin-email">
              Email
            </label>

            <input
              id="admin-email"
              name="email"
              className="input"
              type="email"
              autoComplete="username"
              placeholder="admin@goldencuts.com"
              required
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="admin-password">
              Password
            </label>

            <div className="password-field">
              <input
                id="admin-password"
                name="password"
                className="input"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter admin password"
                required
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPw((prev) => !prev)}
                disabled={loading}
              >
                {showPw ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>
      </div>
    </div>
  );
}