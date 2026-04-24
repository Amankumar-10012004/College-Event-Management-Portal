import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, X, LogOut, User, LayoutDashboard, Calendar, Trophy, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const ROLE_COLORS = { student: 'text-emerald-400', organizer: 'text-amber-400', admin: 'text-rose-400' };
const CATEGORY_COLORS = {
  tech: 'bg-blue-500/20 text-blue-300',
  cultural: 'bg-purple-500/20 text-purple-300',
  sports: 'bg-green-500/20 text-green-300',
  academic: 'bg-yellow-500/20 text-yellow-300',
  workshop: 'bg-orange-500/20 text-orange-300',
  other: 'bg-gray-500/20 text-gray-300',
};

export { CATEGORY_COLORS };

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showBell, setShowBell] = useState(false);
  const [readIds, setReadIds] = useState(() => JSON.parse(localStorage.getItem('readAnn') || '[]'));
  const bellRef = useRef(null);

  useEffect(() => {
    if (user) {
      API.get('/announcements').then(r => setAnnouncements(r.data)).catch(() => {});
    }
  }, [user]);

  const unread = announcements.filter(a => !readIds.includes(a._id)).length;

  const markRead = (id) => {
    const updated = [...new Set([...readIds, id])];
    setReadIds(updated);
    localStorage.setItem('readAnn', JSON.stringify(updated));
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const dashLink = user?.role === 'admin' ? '/admin' :
    user?.role === 'organizer' ? '/organizer' : '/dashboard';

  return (
    <nav className="glass-dark sticky top-0 z-50 border-b border-primary-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-2xl">🎓</span>
            <span className="gradient-text">CampusEvents</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`text-sm font-medium transition-colors duration-200 ${location.pathname === to ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <Link to="/events/create" className="hidden md:flex btn-primary py-2 px-4 text-sm gap-1 items-center">
                    <Plus size={16} /> New Event
                  </Link>
                )}
                {/* Bell */}
                <div className="relative" ref={bellRef}>
                  <button onClick={() => setShowBell(!showBell)}
                    className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full text-xs flex items-center justify-center font-bold">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  {showBell && (
                    <div className="absolute right-0 top-12 w-80 glass-dark rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-white/10 font-semibold text-sm">Announcements</div>
                      {announcements.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500">No announcements</p>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          {announcements.map(a => (
                            <div key={a._id} onClick={() => markRead(a._id)}
                              className={`p-3 border-b border-white/5 cursor-pointer hover:bg-white/5 ${!readIds.includes(a._id) ? 'bg-primary-600/10' : ''}`}>
                              <div className="flex justify-between items-start">
                                <p className="font-semibold text-sm">{a.title}</p>
                                {a.priority === 'high' && <span className="badge-chip bg-red-500/20 text-red-400 text-xs">!</span>}
                              </div>
                              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{a.body}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dashboard link */}
                <Link to={dashLink} className="p-2 text-gray-400 hover:text-white transition-colors hidden md:block">
                  <LayoutDashboard size={20} />
                </Link>

                {/* Profile */}
                <Link to="/profile" className="flex items-center gap-2 glass px-3 py-1.5 rounded-xl hover:border-primary-500/40 transition-all">
                  <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className={`hidden md:block text-sm font-medium ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                </Link>

                <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Login</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-400 hover:text-white">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">
                <Icon size={18} /> {label}
              </Link>
            ))}
            {user && (
              <>
                <Link to={dashLink} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <Link to="/events/create" onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-primary-400 hover:bg-white/5 rounded-lg">
                    <Plus size={18} /> Create Event
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
