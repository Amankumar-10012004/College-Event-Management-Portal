import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Calendar, Edit, Trash2, Eye, BarChart2, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('events');

  useEffect(() => {
    API.get('/events/organizer/my').then(r => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await API.delete(`/events/${id}`);
      setEvents(e => e.filter(ev => ev._id !== id));
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const totalReg = events.reduce((s, e) => s + e.totalRegistrations, 0);
  const totalAttendance = events.reduce((s, e) => s + e.attendanceCount, 0);

  const chartData = events.map(e => ({
    name: e.title.substring(0, 15) + (e.title.length > 15 ? '…' : ''),
    registered: e.totalRegistrations,
    attended: e.attendanceCount,
    capacity: e.capacity,
  }));

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1">Organizer Dashboard</h1>
          <p className="text-gray-400">Manage your events and track attendance</p>
        </div>
        <Link to="/events/create" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Create Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', value: events.length, icon: Calendar },
          { label: 'Total Registrations', value: totalReg, icon: Users },
          { label: 'Total Attendance', value: totalAttendance, icon: Star },
          { label: 'Attendance Rate', value: totalReg > 0 ? `${((totalAttendance / totalReg) * 100).toFixed(0)}%` : '0%', icon: BarChart2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass rounded-2xl p-5 text-center">
            <Icon size={24} className="text-primary-400 mx-auto mb-2" />
            <div className="text-2xl font-black gradient-text">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['events', 'analytics'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${tab === t
              ? 'bg-primary-600 text-white' : 'glass text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'events' && (
        <div className="space-y-3">
          {loading ? [...Array(4)].map((_, i) => <div key={i} className="glass rounded-xl h-20 animate-pulse" />) :
            events.length === 0 ? (
              <div className="glass rounded-2xl p-16 text-center text-gray-500">
                <Calendar size={48} className="mx-auto mb-3 opacity-30" />
                <p className="mb-4">No events yet</p>
                <Link to="/events/create" className="btn-primary inline-flex items-center gap-2">
                  <Plus size={18} /> Create Your First Event
                </Link>
              </div>
            ) : events.map(event => (
              <div key={event._id} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all">
                <div className="text-3xl">{event.category === 'tech' ? '💻' : event.category === 'cultural' ? '🎭' : '🎪'}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{event.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(event.date).toLocaleDateString('en-IN')} • {event.totalRegistrations}/{event.capacity} registered
                  </p>
                </div>
                <span className={`badge-chip text-xs capitalize ${
                  event.status === 'upcoming' ? 'bg-emerald-500/20 text-emerald-400' :
                  event.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-blue-500/20 text-blue-400'}`}>
                  {event.status}
                </span>
                <div className="flex items-center gap-2">
                  <Link to={`/events/${event._id}`} className="p-2 glass rounded-lg text-gray-400 hover:text-white transition-colors">
                    <Eye size={16} />
                  </Link>
                  <Link to={`/events/${event._id}/edit`} className="p-2 glass rounded-lg text-gray-400 hover:text-primary-400 transition-colors">
                    <Edit size={16} />
                  </Link>
                  <button onClick={() => handleDelete(event._id)} className="p-2 glass rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {tab === 'analytics' && chartData.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <BarChart2 size={20} className="text-primary-400" /> Registration vs Attendance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="registered" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Registered" />
              <Bar dataKey="attended" fill="#10b981" radius={[4, 4, 0, 0]} name="Attended" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
