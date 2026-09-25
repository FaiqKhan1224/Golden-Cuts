import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', marginTop: 60 }}>
      <div className="container" style={{ padding: '56px 24px 28px' }}>
        <div className="grid grid-4">
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, marginBottom: 10 }}>
              <span className="gold">GOLDEN</span> CUTS
            </div>
            <p className="text-muted" style={{ fontSize: 14 }}>Premium Grooming</p>
          </div>
          <div>
            <h4 className="gold" style={{ fontSize: 15 }}>Quick Links</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              {[['/', 'Home'], ['/services', 'Services'], ['/barbers', 'Barbers'], ['/gallery', 'Gallery'], ['/about', 'About'], ['/find-us', 'Find Us'], ['/contact', 'Contact']]
                .map(([to, label]) => <li key={to}><Link to={to} className="text-secondary" style={{ fontSize: 14 }}>{label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4 className="gold" style={{ fontSize: 15 }}>Customer</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              <li><Link to="/my-appointments" className="text-secondary" style={{ fontSize: 14 }}>My Appointments</Link></li>
              <li><Link to="/profile" className="text-secondary" style={{ fontSize: 14 }}>Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="gold" style={{ fontSize: 15 }}>Contact</h4>
            <p className="text-secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>
              11402 NW 41st St #215<br />Doral, FL 33178<br />United States<br /><br />
              9:00 AM — 11:30 PM
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 40, paddingTop: 20 }} className="text-muted">
          <small>© {new Date().getFullYear()} Golden Cuts. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}
