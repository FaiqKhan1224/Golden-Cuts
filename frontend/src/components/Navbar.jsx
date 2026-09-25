import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const publicLinks = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/barbers', 'Barbers'],
  ['/gallery', 'Gallery'],
  ['/about', 'About'],
  ['/find-us', 'Find Us'],
  ['/contact', 'Contact'],
];

const userLinks = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/barbers', 'Barbers'],
  ['/gallery', 'Gallery'],
  ['/my-appointments', 'My Appointments'],
  ['/profile', 'Profile'],
  ['/find-us', 'Find Us'],
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const links = user ? userLinks : publicLinks;

  return (
    <header
      style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 76,
        }}
      >
        {/* LOGO */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <img
            src="/logo.png"
            alt="Golden Cuts Barber Shop"
            style={{
              height: 42,
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav
          style={{
            display: 'flex',
            gap: 28,
          }}
          className="nav-desktop"
        >
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                fontSize: 14,
                fontWeight: 600,
                color: isActive
                  ? 'var(--gold)'
                  : 'var(--text-primary)',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* DESKTOP BUTTONS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
          className="nav-desktop"
        >
          {user ? (
            <>
              <Link
                to="/book-appointment"
                className="btn btn-primary btn-sm"
              >
                Book Appointment
              </Link>

              <button
                className="btn btn-dark btn-sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/book-appointment"
                className="btn btn-primary btn-sm"
              >
                Book Appointment
              </Link>

              <Link
                to="/login"
                className="btn btn-outline btn-sm"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="hamburger"
          onClick={() => setOpen((o) => !o)}
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--gold)',
            width: 40,
            height: 40,
            fontSize: 18,
          }}
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            padding: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            {links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {label}
              </Link>
            ))}

            <Link
              to="/book-appointment"
              onClick={() => setOpen(false)}
              className="btn btn-primary"
            >
              Book Appointment
            </Link>

            {user ? (
              <button
                className="btn btn-dark"
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate('/');
                }}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="btn btn-outline"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}

      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 900px) {
          .nav-desktop {
            display: none !important;
          }

          .hamburger {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
        }

        @media (max-width: 500px) {
          .container {
            height: 68px !important;
          }

          .container img {
            height: 38px !important;
          }
        }
      `}</style>
    </header>
  );
}