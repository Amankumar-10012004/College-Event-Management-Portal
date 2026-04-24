import { useState } from 'react';
import { User, Mail, BookOpen, GraduationCap, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Chemical','MBA','BBA','Other'];
const ROLE_COLORS = { student:'bg-emerald-500/20 text-emerald-400', organizer:'bg-amber-500/20 text-amber-400', admin:'bg-rose-500/20 text-rose-400' };

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', year: user?.year || '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.put('/auth/profile', form);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-3xl font-black mb-8">My Profile</h1>

      {/* Profile Header */}
      <div className="glass rounded-3xl p-8 mb-6 bg-gradient-to-r from-primary-600/20 to-violet-600/10 border border-primary-500/20">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center text-3xl font-black">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black">{user?.name}</h2>
            <p className="text-gray-400 mb-2">{user?.email}</p>
            <span className={`badge-chip text-sm capitalize ${ROLE_COLORS[user?.role]}`}>{user?.role}</span>
          </div>
          <div className="ml-auto text-right hidden md:block">
            <div className="text-4xl font-black gradient-text">{user?.points || 0}</div>
            <div className="text-xs text-gray-400">Points</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">🏅 Earned Badges</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.badges.map((b, i) => (
              <div key={i} className="flex items-center gap-3 glass p-3 rounded-xl border border-primary-500/20">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{b.name}</p>
                  <p className="text-xs text-gray-400">{b.description}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{new Date(b.earnedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-bold mb-6">Edit Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input className="input-field pl-9" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email (read-only)</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input disabled className="input-field pl-9 opacity-50 cursor-not-allowed" value={user?.email} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Department</label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select className="input-field pl-9 appearance-none" value={form.department} onChange={e => set('department', e.target.value)}>
                  <option value="">Select</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-dark-800">{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Year</label>
              <div className="relative">
                <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select className="input-field pl-9 appearance-none" value={form.year} onChange={e => set('year', e.target.value)}>
                  <option value="">Year</option>
                  {[1,2,3,4,5].map(y => <option key={y} value={y} className="bg-dark-800">Year {y}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
