import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type LearningModule, type LearnerSummary, type Assignment } from '../api/client';
import { getAdminToken } from '../lib/adminSession';

export default function AdminAssignments() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getAdminToken()) navigate('/admin/login', { replace: true });
  }, [navigate]);

  const [modules, setModules] = useState<LearningModule[]>([]);
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ learnerId: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.modules.list(), api.adminProgress.learners()])
      .then(([mods, lrns]) => { setModules(mods); setLearners(lrns); })
      .catch(() => {});
  }, []);

  async function loadAssignments(moduleId: string) {
    setSelectedModule(moduleId);
    if (!moduleId) { setAssignments([]); return; }
    setLoading(true);
    try {
      setAssignments(await api.assignments.forModule(moduleId));
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }

  async function assign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedModule || !form.learnerId) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.assignments.create({ moduleId: selectedModule, learnerId: form.learnerId });
      await loadAssignments(selectedModule);
      setForm({ learnerId: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    await api.assignments.remove(id);
    setAssignments(a => a.filter(x => x.id !== id));
  }

  const unassignedLearners = learners.filter(
    l => !assignments.some(a => a.learnerId === l.learnerId),
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Module Assignments</h1>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select module</label>
        <select
          className="border rounded px-3 py-2 text-sm w-full max-w-sm"
          value={selectedModule}
          onChange={e => loadAssignments(e.target.value)}
        >
          <option value="">— choose a module —</option>
          {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </div>

      {selectedModule && (
        <>
          <form onSubmit={assign} className="flex gap-2 mb-4">
            <select
              className="border rounded px-3 py-1.5 text-sm flex-1"
              value={form.learnerId}
              onChange={e => setForm(f => ({ ...f, learnerId: e.target.value }))}
            >
              <option value="">— assign learner —</option>
              {unassignedLearners.map(l => (
                <option key={l.learnerId} value={l.learnerId}>{l.handle}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={submitting || !form.learnerId}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '…' : 'Assign'}
            </button>
          </form>

          {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

          {loading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : assignments.length === 0 ? (
            <p className="text-gray-400 text-sm">No assignments yet for this module.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-4 font-medium">Learner</th>
                  <th className="py-2 pr-4 font-medium">Assigned by</th>
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id} className="border-b">
                    <td className="py-2 pr-4 font-mono text-blue-700">
                      {learners.find(l => l.learnerId === a.learnerId)?.handle ?? a.learnerId ?? a.groupId ?? '—'}
                    </td>
                    <td className="py-2 pr-4 text-gray-500">{a.assignedBy}</td>
                    <td className="py-2 pr-4 text-gray-400">{new Date(a.assignedAt).toLocaleDateString()}</td>
                    <td className="py-2">
                      <button
                        onClick={() => remove(a.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
