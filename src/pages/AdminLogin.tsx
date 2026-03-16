import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { setAdminSession } from '../lib/adminSession';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await api.auth.adminLogin(username.trim(), password);
      setAdminSession(result.token, result.username);
      navigate('/kb-admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 mt-16">
      <h1 className="text-xl font-bold mb-1">Admin Login</h1>
      <p className="text-gray-500 text-sm mb-6">Enter your admin credentials.</p>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
          autoComplete="username"
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !username.trim() || !password}
          className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
