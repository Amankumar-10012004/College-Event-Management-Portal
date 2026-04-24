import { useState, useEffect } from 'react';
import { Users, Calendar, BarChart2, Megaphone, Trash2, Shield, UserCheck } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import API from '../api/axios';

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];
const ROLE_COLORS = { student: 'text-emerald-400 bg-emerald-500/20', organizer: 'text-amber-400 bg-amber-500/20', admin: 'text-rose-400 bg-rose-500/20' };

export default function AdminDashboard() {
  const [tab, setTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annForm, setAnnForm] = useState({ title: '', body: '', targetRole: 'all', priority: 'medium' });
  const [annLoading, setAnnLoading] = useState(false);

  useEffect(() => {
    Promise.all([API.get('/admin/analytics'), API.get('/admin/users')])
      .then(([a, u]) => { setAnalytics(a.data); setUsers(u.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await API.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(u => u.map(us => us._id === userId ? updated.data : us));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(u => u.filter(us => us._id !== userId));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    setAnnLoading(true);
    try {
      await API.post('/announcements', annForm);
      toast.success('Announcement posted!');
      setAnnForm({ title: '', body: '', targetRole: 'all', priority: 'medium' });
    } catch { toast.error('Failed to post'); }
    finally { setAnnLoading(false); }
  };

  const tabs = [
    { key: 'analytics', label: 'Analytics', icon: BarChart2 },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'announce', label: 'Announcements', icon: Megaphone },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1 flex items-center gap-3"><Shield className="text-rose-400" size={32} /> Admin Panel</h1>
        <p className="text-gray-400">Platform overview and management</p>
      </div>

      {/* Top stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: analytics.totals.users, icon: '👥' },
            { label: 'Total Events', value: analytics.totals.events, icon: '📅' },
            { label: 'Registrations', value: analytics.totals.registrations, icon: '✅' },
            { label: 'Attendance Rate', value: `${analytics.totals.attendanceRate}%`, icon: '📊' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="glass rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-2xl font-black gradient-text">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === key
              ? 'bg-primary-600 text-white' : 'glass text-gray-400 hover:text-white'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {tab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registrations per event */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold mb-4">Top Events by Registrations</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.regPerEvent} margin={{ top: 5, right: 10, left: -10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#7c3aed" radius={[4,4,0,0]} name="Registrations" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold mb-4">Events by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics.categoryStats.map(c => ({ name: c._id, value: c.count }))}
                  cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {analytics.categoryStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Role breakdown */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold mb-4">Users by Role</h3>
            <div className="space-y-3">
              {analytics.roleStats.map(({ _id, count }) => (
                <div key={_id} className="flex items-center justify-between">
                  <span className={`badge-chip capitalize ${ROLE_COLORS[_id]}`}>{_id}</span>
                  <div className="flex-1 mx-4 h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${(count / analytics.totals.users) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top rated events */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold mb-4">Top Rated Events</h3>
            <div className="space-y-3">
              {analytics.avgRatings.map(({ _id, name, avg, count }) => (
                <div key={_id} className="flex items-center gap-3">
                  <div className="flex-1 truncate text-sm">{name}</div>
                  <div className="text-amber-400 font-bold text-sm">{Number(avg).toFixed(1)} ★</div>
                  <div className="text-xs text-gray-500">({count})</div>
                </div>
              ))}
              {analytics.avgRatings.length === 0 && <p className="text-gray-500 text-sm">No ratings yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Name', 'Email', 'Role', 'Points', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-lg border-0 font-semibold bg-transparent capitalize cursor-pointer ${ROLE_COLORS[u.role]}`}>
                        {['student', 'organizer', 'admin'].map(r => <option key={r} value={r} className="bg-dark-800 text-white">{r}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary-400">{u.points}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {tab === 'announce' && (
        <div className="glass rounded-2xl p-6 max-w-2xl">
          <h3 className="font-bold mb-6 flex items-center gap-2"><Megaphone size={20} className="text-primary-400" /> Post Announcement</h3>
          <form onSubmit={handleAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input required className="input-field" placeholder="Announcement title"
                value={annForm.title} onChange={e => setAnnForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Message</label>
              <textarea required className="input-field resize-none" rows={4} placeholder="Write your announcement..."
                value={annForm.body} onChange={e => setAnnForm(f => ({ ...f, body: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target</label>
                <select className="input-field" value={annForm.targetRole} onChange={e => setAnnForm(f => ({ ...f, targetRole: e.target.value }))}>
                  <option value="all">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="organizer">Organizers Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Priority</label>
                <select className="input-field" value={annForm.priority} onChange={e => setAnnForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (urgent)</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={annLoading} className="btn-primary flex items-center gap-2">
              <Megaphone size={18} /> {annLoading ? 'Posting...' : 'Post Announcement'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

