import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowLeft, Edit, Trash2, Star, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CAT_ICONS = { tech:'💻',cultural:'🎭',sports:'🏆',academic:'📚',workshop:'🔧',other:'🎪' };
const CAT_COLORS = {
  tech:'text-blue-400 bg-blue-500/10 border-blue-500/20',
  cultural:'text-purple-400 bg-purple-500/10 border-purple-500/20',
  sports:'text-green-400 bg-green-500/10 border-green-500/20',
  academic:'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  workshop:'text-orange-400 bg-orange-500/10 border-orange-500/20',
  other:'text-pink-400 bg-pink-500/10 border-pink-500/20',
};

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange && onChange(s)}
          className={`text-2xl transition-transform hover:scale-110 ${s <= (hover || value) ? 'text-amber-400' : 'text-gray-600'}`}>
          ★
        </button>
      ))}
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [reg, setReg] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [fbForm, setFbForm] = useState({ rating: 0, comment: '' });
  const [fbLoading, setFbLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [evRes, fbRes] = await Promise.all([
        API.get(`/events/${id}`),
        API.get(`/feedback/${id}`),
      ]);
      setEvent(evRes.data);
      setFeedbacks(fbRes.data.feedbacks);
      setAvgRating(fbRes.data.avgRating);
      if (user) {
        try {
          const myRegs = await API.get('/registrations/my');
          const myReg = myRegs.data.find(r => r.event?._id === id || r.event === id);
          setReg(myReg || null);
        } catch {}
      }
    } catch (err) {
      toast.error('Event not found');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, user]);

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    setRegLoading(true);
    try {
      const res = await API.post(`/registrations/${id}/register`);
      toast.success(res.data.isWaitlisted ? `Added to waitlist #${res.data.waitlistPosition}` : '🎉 Registered! Check your QR code below.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your registration?')) return;
    setRegLoading(true);
    try {
      await API.delete(`/registrations/${id}/cancel`);
      setReg(null);
      toast.success('Registration cancelled');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    } finally {
      setRegLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await API.delete(`/events/${id}`);
      toast.success('Event deleted');
      navigate('/events');
    } catch { toast.error('Failed to delete event'); }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (fbForm.rating === 0) return toast.error('Please select a rating');
    setFbLoading(true);
    try {
      await API.post(`/feedback/${id}`, fbForm);
      toast.success('Feedback submitted! +5 pts 🎉');
      setFbForm({ rating: 0, comment: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setFbLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!event) return null;

  const isPastEvent = new Date(event.date) < new Date();
  const canFeedback = isPastEvent && reg?.status === 'attended' && !feedbacks.find(f => f.student?._id === user?._id);
  const isOrganizer = user && (user._id === event.organizer?._id?.toString() || user.role === 'admin');
  const spotsLeft = event.capacity - event.totalRegistrations;

  return (
    <div className="page-container max-w-5xl">
      <Link to="/events" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} /> Back to Events
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Poster */}
          <div className="rounded-2xl overflow-hidden h-72 bg-dark-700 relative">
            {event.poster ? (
              <img src={`http://localhost:5000${event.poster}`} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {CAT_ICONS[event.category]}
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`badge-chip text-sm px-3 py-1.5 rounded-xl border ${CAT_COLORS[event.category]}`}>
                {CAT_ICONS[event.category]} {event.category}
              </span>
              {event.isPaid && <span className="badge-chip bg-amber-500/20 text-amber-300 border border-amber-500/30">💳 ₹{event.price}</span>}
            </div>
          </div>

          {/* Details */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-black">{event.title}</h1>
              {isOrganizer && (
                <div className="flex gap-2 shrink-0">
                  <Link to={`/events/${id}/edit`} className="p-2 glass rounded-xl text-gray-400 hover:text-white transition-colors"><Edit size={18} /></Link>
                  <button onClick={handleDelete} className="p-2 glass rounded-xl text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={16} className="text-primary-400" />
                {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={16} className="text-primary-400" /> {event.venue}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Users size={16} className={spotsLeft <= 0 ? 'text-red-400' : spotsLeft <= 5 ? 'text-amber-400' : 'text-primary-400'} />
                {spotsLeft <= 0 ? 'Full – Waitlist' : `${spotsLeft}/${event.capacity} left`}
              </div>
            </div>
            {/* Capacity bar */}
            <div className="mb-6">
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-600 to-violet-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (event.totalRegistrations / event.capacity) * 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{event.totalRegistrations} registered</span>
                <span>Capacity: {event.capacity}</span>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {event.tags.map(t => <span key={t} className="badge-chip bg-white/5 text-gray-400 text-xs">#{t}</span>)}
              </div>
            )}
          </div>

          {/* Feedback */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="text-amber-400" size={22} />
              <h2 className="text-xl font-bold">Reviews</h2>
              {avgRating > 0 && <span className="text-amber-400 font-bold">{avgRating} ★ ({feedbacks.length})</span>}
            </div>
            {canFeedback && (
              <form onSubmit={handleFeedback} className="mb-6 p-4 bg-primary-600/10 rounded-xl border border-primary-500/20">
                <p className="text-sm font-semibold mb-3 text-primary-300">Share your experience</p>
                <StarRating value={fbForm.rating} onChange={r => setFbForm(f => ({ ...f, rating: r }))} />
                <textarea className="input-field mt-3 resize-none" rows={3} placeholder="Write a review..."
                  value={fbForm.comment} onChange={e => setFbForm(f => ({ ...f, comment: e.target.value }))} />
                <button type="submit" disabled={fbLoading} className="btn-primary mt-3 py-2 px-5 text-sm">
                  {fbLoading ? 'Submitting…' : 'Submit Feedback'}
                </button>
              </form>
            )}
            {feedbacks.length === 0 ? <p className="text-gray-500 text-sm">No reviews yet</p> : (
              <div className="space-y-4">
                {feedbacks.map(f => (
                  <div key={f._id} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {f.student?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{f.student?.name}</p>
                        <div className="text-amber-400 text-xs">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</div>
                      </div>
                    </div>
                    {f.comment && <p className="text-gray-400 text-sm">{f.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Organizer */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold mb-3 text-gray-300 text-sm">Organized by</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center font-bold">
                {event.organizer?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{event.organizer?.name}</p>
                <p className="text-xs text-gray-400">{event.organizer?.department}</p>
              </div>
            </div>
          </div>

          {/* Registration */}
          <div className="glass rounded-2xl p-5 border border-primary-500/20">
            <h3 className="font-bold text-xl mb-1">{event.isPaid ? `₹${event.price}` : 'Free'}</h3>
            <p className="text-gray-400 text-sm mb-5">{spotsLeft <= 0 ? 'Event full – waitlist open' : `${spotsLeft} spots remaining`}</p>

            {!user ? (
              <Link to="/login" className="btn-primary w-full block text-center">Login to Register</Link>
            ) : user.role !== 'student' ? (
              <p className="text-gray-500 text-sm text-center py-2">Only students can register</p>
            ) : reg ? (
              <div className="space-y-3">
                <div className={`p-3 rounded-xl text-center text-sm font-semibold ${
                  reg.status === 'attended' ? 'bg-emerald-500/20 text-emerald-400' :
                  reg.status === 'waitlisted' ? 'bg-amber-500/20 text-amber-400' : 'bg-primary-600/20 text-primary-300'}`}>
                  {reg.status === 'attended' ? '✅ Attended' : reg.status === 'waitlisted' ? `⏳ Waitlist #${reg.waitlistPosition}` : '✅ Registered'}
                </div>
                {reg.status === 'registered' && (
                  <>
                    <button onClick={() => setShowQR(!showQR)} className="btn-secondary w-full flex items-center justify-center gap-2 py-2 text-sm">
                      <QrCode size={16} /> {showQR ? 'Hide QR' : 'Show QR Code'}
                    </button>
                    {showQR && reg.qrCode && (
                      <div className="flex justify-center p-4 bg-white rounded-xl">
                        <QRCodeSVG value={reg.qrCode} size={180} />
                      </div>
                    )}
                    <button onClick={handleCancel} disabled={regLoading} className="btn-danger w-full text-sm">
                      Cancel Registration
                    </button>
                  </>
                )}
              </div>
            ) : !isPastEvent ? (
              <button onClick={handleRegister} disabled={regLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                {regLoading
                  ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : spotsLeft <= 0 ? '⏳ Join Waitlist' : '⚡ Register Now'}
              </button>
            ) : (
              <p className="text-gray-500 text-sm text-center py-2">Registration closed</p>
            )}
          </div>

          {/* Stats */}
          <div className="glass rounded-2xl p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Registered</span>
              <span className="font-semibold">{event.totalRegistrations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Attendance Count</span>
              <span className="font-semibold">{event.attendanceCount}</span>
            </div>
            {avgRating > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Rating</span>
                <span className="font-semibold text-amber-400">{avgRating} ★</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
