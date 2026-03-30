import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { getAdminToken, getAdminUsername, clearAdminSession } from '../lib/adminSession';

export default function AdminProfile() {
  const navigate = useNavigate();
  if (!getAdminToken()) { navigate('/admin/login', { replace: true }); return null; }

  const username = getAdminUsername() ?? 'admin';
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) { setErr('Passwords do not match'); return; }
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      await api.adminProfile.changePassword(newPassword);
      setMsg('Password changed. You will need to log in again.');
      clearAdminSession();
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Admin Profile</h1>
        <Link to="/admin" className="text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
          ← Dashboard
        </Link>
      </div>

      <div className="mb-6 p-4 border rounded bg-gray-50">
        <p className="text-sm text-gray-500">Logged in as</p>
        <p className="font-semibold">{username}</p>
      </div>

      <h2 className="font-semibold text-gray-700 mb-3">Change Password</h2>
      <form onSubmit={changePassword} className="space-y-3">
        <input
          type="password"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="New password (min 8 chars)"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Confirm new password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
        {err && <p className="text-red-600 text-xs">{err}</p>}
        {msg && <p className="text-green-600 text-xs">{msg}</p>}
        <button
          type="submit"
          disabled={saving || newPassword.length < 8 || !confirm}
          className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Change password'}
        </button>
      </form>
    </div>
  );
}
