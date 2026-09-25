import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const QUICK_ACTIONS = [
  'Book Appointment', 'Find a Barber', 'Check Availability', 'View Services', 'My Appointment',
];

export default function AIAssistant() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your Golden Cuts AI Assistant. I can help you choose a service, find a barber, check availability, and guide you through your appointment booking." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content) return;
    const nextMessages = [...messages, { role: 'user', content }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await client.post('/ai/chat', {
        text: content,
        messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(m => [...m, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: "I'm unable to check live appointment availability right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickAction(action) {
    if (action === 'Book Appointment') return navigate('/book-appointment');
    if (action === 'View Services') return navigate('/services');
    if (action === 'Find a Barber') return navigate('/barbers');
    if (action === 'My Appointment') return user ? navigate('/my-appointments') : send('What is my next appointment?');
    send(action === 'Check Availability' ? 'Which barber would you like to check availability for?' : action);
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="AI Assistant"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 60, height: 60, borderRadius: '50%',
          background: 'var(--bg-card)', border: '1px solid var(--gold)',
          color: 'var(--gold)', fontSize: 26,
          boxShadow: '0 0 0 4px rgba(212,167,44,0.08), var(--shadow)',
        }}
      >
        {open ? '✕' : '✨'}
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 24, zIndex: 998,
          width: 360, maxWidth: 'calc(100vw - 32px)', height: 500, maxHeight: 'calc(100vh - 140px)',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: 'var(--shadow)',
        }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>GOLDEN CUTS AI</div>
            <div className="text-muted" style={{ fontSize: 12 }}>Your Personal Grooming & Booking Assistant</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'var(--gold)' : 'var(--bg-secondary)',
                color: m.role === 'user' ? '#14110a' : 'var(--text-primary)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border)',
                padding: '10px 14px', borderRadius: 14, maxWidth: '85%', fontSize: 14, lineHeight: 1.5,
              }}>
                {m.content}
              </div>
            ))}
            {loading && <div className="text-muted" style={{ fontSize: 13 }}>Typing…</div>}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '10px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
            {QUICK_ACTIONS.map(a => (
              <button key={a} onClick={() => handleQuickAction(a)} className="btn btn-outline btn-sm" style={{ padding: '6px 10px', fontSize: 12 }}>
                {a}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)' }}>
            <input
              className="input" placeholder="Ask about services, barbers, availability…"
              value={input} onChange={e => setInput(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}
