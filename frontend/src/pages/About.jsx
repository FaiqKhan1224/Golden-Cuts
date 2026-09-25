export default function About() {
  return (
    <div className="container section">
      <p className="eyebrow">About Us</p>
      <h1 style={{ maxWidth: 640, marginBottom: 32 }}>MORE THAN A BARBERSHOP. <span className="gold">IT'S YOUR STYLE.</span></h1>
      <div className="grid grid-3">
        <div className="card">
          <h4>Our Story</h4>
          <p className="text-muted" style={{ fontSize: 14 }}>Golden Cuts was founded on a simple idea: every client deserves a premium, personalized grooming experience.</p>
        </div>
        <div className="card">
          <h4>Our Philosophy</h4>
          <p className="text-muted" style={{ fontSize: 14 }}>We believe grooming is a craft — precision, patience, and attention to detail define everything we do.</p>
        </div>
        <div className="card">
          <h4>Why Choose Us</h4>
          <p className="text-muted" style={{ fontSize: 14 }}>Expert barbers, premium products, and a modern, comfortable environment built around you.</p>
        </div>
      </div>
      <div className="grid grid-4" style={{ marginTop: 48 }}>
        {['Premium Experience', 'Expert Barbers', 'Quality Products', 'Personal Service'].map(f => (
          <div key={f} className="card"><h4 style={{ fontSize: 15 }}>{f}</h4></div>
        ))}
      </div>
    </div>
  );
}
