import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, BookOpen, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = ['Computer Science','Information Technology','Electronics','Mechanical','Civil','Chemical','MBA','BBA','Other'];
const YEARS = [1, 2, 3, 4, 5];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', year: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to CampusEvents, ${user.name}! 🎉`);
      navigate(user.role === 'organizer' ? '/organizer' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-3xl font-black mb-2">Create Account</h1>
          <p className="text-gray-400">Join thousands of students on CampusEvents</p>
        </div>
        <div className="glass rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3">
              {['student', 'organizer'].map(r => (
                <button key={r} type="button" onClick={() => set('role', r)}
                  className={`py-3 rounded-xl border font-semibold text-sm capitalize transition-all ${form.role === r
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary-500/50'}`}>
                  {r === 'student' ? '👤 Student' : '🎯 Organizer'}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="John Doe" required className="input-field pl-11"
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" placeholder="you@college.edu" required className="input-field pl-11"
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" placeholder="Min 6 characters" required className="input-field pl-11"
                  value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                <div className="relative">
                  <BookOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select className="input-field pl-9 pr-3 appearance-none"
                    value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">Select</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                <div className="relative">
                  <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select className="input-field pl-9 pr-3 appearance-none"
                    value={form.year} onChange={e => set('year', e.target.value)}>
                    <option value="">Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}{['st','nd','rd','th'][Math.min(y-1,3)]} Year</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center flex text-base mt-2">
              {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account 🚀'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
