import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
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

    setForm(prev => ({
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

      const res = await client.post('/auth/login', {
        email,
        password,
      });

      if (!res.data?.token || !res.data?.user) {
        throw new Error('Invalid login response from server.');
      }

      login(res.data.token, res.data.user);

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Customer login error:', err);

      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        setError('Invalid email or password.');
      } else if (status === 403) {
        setError('Your account is currently suspended.');
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
    <div className="container section" style={{ maxWidth: 440 }}>
      <div className="card">
        <h2 style={{ textAlign: 'center' }}>
          Welcome Back
        </h2>

        <p
          className="text-muted"
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Login to your Golden Cuts account
        </p>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-field">
              <input
                id="password"
                name="password"
                className="input"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPw(prev => !prev)}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: 16,
          }}
        >
          <Link
            to="/forgot-password"
            className="text-muted"
          >
            Forgot password?
          </Link>
        </p>

        <p
          style={{
            textAlign: 'center',
            marginTop: 8,
          }}
          className="text-muted"
        >
          No account?{' '}
          <Link
            to="/signup"
            className="gold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
