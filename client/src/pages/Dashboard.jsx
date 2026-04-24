import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, QrCode, Award, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  registered: 'bg-primary-600/20 text-primary-300 border-primary-500/30',
  waitlisted: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  attended: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState(null);

  useEffect(() => {
    API.get('/registrations/my').then(r => setRegistrations(r.data)).finally(() => setLoading(false));
  }, []);

  const upcoming = registrations.filter(r => r.event && new Date(r.event.date) >= new Date() && r.status !== 'cancelled');
  const past = registrations.filter(r => r.event && new Date(r.event.date) < new Date());
  const attended = registrations.filter(r => r.status === 'attended').length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="glass rounded-3xl p-8 mb-8 bg-gradient-to-r from-primary-600/20 to-violet-600/10 border border-primary-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-2xl font-black">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black">{user?.name}</h1>
            <p className="text-gray-400">{user?.department} {user?.year ? `• Year ${user.year}` : ''}</p>
          </div>
          <div className="ml-auto text-right hidden md:block">
            <div className="text-3xl font-black gradient-text">{user?.points || 0}</div>
            <div className="text-xs text-gray-400">Points Earned</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Registered', value: upcoming.length, icon: Calendar, color: 'text-primary-400' },
          { label: 'Attended', value: attended, icon: Award, color: 'text-emerald-400' },
          { label: 'Points', value: user?.points || 0, icon: '⭐', color: 'text-amber-400' },
          { label: 'Badges', value: user?.badges?.length || 0, icon: '🏅', color: 'text-violet-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-5 text-center">
            <div className={`text-2xl mb-2 ${typeof Icon === 'string' ? '' : color}`}>
              {typeof Icon === 'string' ? Icon : <Icon size={24} className="mx-auto" />}
            </div>
            <div className="text-2xl font-black">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {user?.badges?.length > 0 && (
        <div className="glass rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><span>🏆</span> My Badges</h2>
          <div className="flex flex-wrap gap-3">
            {user.badges.map((b, i) => (
              <div key={i} className="flex items-center gap-2 glass px-4 py-2 rounded-xl border border-primary-500/20">
                <span className="text-xl">{b.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{b.name}</p>
                  <p className="text-xs text-gray-400">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Registrations */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Clock size={20} className="text-primary-400" /> Upcoming Events</h2>
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="glass rounded-xl h-20 animate-pulse" />)}</div>
      ) : upcoming.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-gray-500 mb-8">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>No upcoming events. <Link to="/events" className="text-primary-400 hover:underline">Browse events</Link></p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {upcoming.map(r => (
            <div key={r._id} className="glass rounded-xl p-4 flex items-center gap-4 hover:border-primary-500/30 transition-all">
              <div className="text-3xl">{r.event.category === 'tech' ? '💻' : r.event.category === 'cultural' ? '🎭' : '🎪'}</div>
              <div className="flex-1 min-w-0">
                <Link to={`/events/${r.event._id}`} className="font-semibold hover:text-primary-300 transition-colors truncate block">
                  {r.event.title}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(r.event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {r.event.venue}
                </p>
              </div>
              <span className={`badge-chip text-xs border ${STATUS_COLORS[r.status]}`}>{r.status}</span>
              {r.status === 'registered' && (
                <button onClick={() => setActiveQR(activeQR === r._id ? null : r._id)}
                  className="p-2 glass rounded-lg text-gray-400 hover:text-white transition-colors">
                  <QrCode size={18} />
                </button>
              )}
              {activeQR === r._id && r.qrCode && (
                <div className="absolute mt-2 p-3 bg-white rounded-xl shadow-xl z-10">
                  <QRCodeSVG value={r.qrCode} size={140} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Past Events */}
      {past.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Award size={20} className="text-emerald-400" /> Past Events</h2>
          <div className="space-y-3">
            {past.map(r => (
              <div key={r._id} className="glass rounded-xl p-4 flex items-center gap-4 opacity-70">
                <div className="text-2xl">{r.event?.category === 'tech' ? '💻' : '🎪'}</div>
                <div className="flex-1 min-w-0">
                  <Link to={`/events/${r.event?._id}`} className="font-semibold hover:text-primary-300 transition-colors truncate block">
                    {r.event?.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{r.event?.venue}</p>
                </div>
                <span className={`badge-chip text-xs border ${STATUS_COLORS[r.status]}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
