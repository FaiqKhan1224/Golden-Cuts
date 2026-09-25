import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  ['/admin', 'Dashboard'], ['/admin/appointments', 'Appointments'], ['/admin/services', 'Services'],
  ['/admin/barbers', 'Barbers'], ['/admin/customers', 'Customers'], ['/admin/gallery', 'Gallery'],
  ['/admin/reviews', 'Reviews'], ['/admin/messages', 'Messages'], ['/admin/reports', 'Reports'],
  ['/admin/settings', 'Settings'],
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: 240, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', padding: 20, flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, marginBottom: 32 }}>
          <span className="gold">GOLDEN</span> CUTS
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/admin'} style={({ isActive }) => ({
              padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              color: isActive ? '#14110a' : 'var(--text-primary)',
              background: isActive ? 'var(--gold)' : 'transparent',
            })}>{label}</NavLink>
          ))}
        </nav>
        <button className="btn btn-dark btn-block" style={{ marginTop: 32 }} onClick={() => { logout(); navigate('/admin/login'); }}>Logout</button>
      </aside>
      <main style={{ flex: 1, background: 'var(--bg-primary)', padding: 32, overflowX: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
