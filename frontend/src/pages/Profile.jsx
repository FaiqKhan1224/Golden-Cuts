import { useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const res = await client.put('/auth/profile', form);
      setUser(res.data.user);
      setMsg({ type: 'success', text: 'Profile updated' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update' });
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    try {
      await client.put('/auth/change-password', pwForm);
      setPwMsg({ type: 'success', text: 'Password changed' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 600 }}>
      <h1 style={{ marginBottom: 24 }}>Profile</h1>

      <div className="card" style={{ marginBottom: 24 }}>
        <h4 className="gold">Edit Profile</h4>
        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
        <form onSubmit={saveProfile}>
          <div className="grid grid-2">
            <div className="field"><label>First Name</label><input className="input" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="field"><label>Last Name</label><input className="input" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
          </div>
          <div className="field"><label>Email</label><input className="input" value={user?.email} disabled /></div>
          <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          <button className="btn btn-primary" type="submit">Save Changes</button>
        </form>
      </div>

      <div className="card">
        <h4 className="gold">Change Password</h4>
        {pwMsg && <div className={`alert alert-${pwMsg.type}`}>{pwMsg.text}</div>}
        <form onSubmit={changePassword}>
          <div className="field">
            <label>Current Password</label>
            <div className="password-field">
              <input className="input" type={showPw ? 'text' : 'password'} value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
              <button type="button" className="password-toggle" onClick={() => setShowPw(s => !s)}>{showPw ? 'HIDE' : 'SHOW'}</button>
            </div>
          </div>
          <div className="field"><label>New Password</label><input className="input" type={showPw ? 'text' : 'password'} value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} /></div>
          <div className="field"><label>Confirm New Password</label><input className="input" type={showPw ? 'text' : 'password'} value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} /></div>
          <button className="btn btn-primary" type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
}
