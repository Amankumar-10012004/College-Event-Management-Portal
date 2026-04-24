import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Calendar, MapPin, Users, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../api/axios';

const CATEGORIES = ['tech','cultural','sports','academic','workshop','other'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', date: '', endDate: '', venue: '', category: 'tech',
    capacity: '', registrationDeadline: '', tags: '', isPaid: false, price: '',
  });
  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPoster(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue || !form.capacity) return toast.error('Fill all required fields');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (poster) fd.append('poster', poster);
      const res = await API.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Event created! 🎉');
      navigate(`/events/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl">
      <h1 className="text-3xl font-black mb-2">Create New Event</h1>
      <p className="text-gray-400 mb-8">Fill in the details to publish your event</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Poster Upload */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Event Poster</h2>
          <label className={`block rounded-xl border-2 border-dashed border-white/20 hover:border-primary-500/50
            transition-colors cursor-pointer overflow-hidden ${preview ? 'h-48' : 'h-40'}`}>
            {preview ? (
              <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                <Upload size={32} />
                <p className="text-sm">Click to upload poster (max 5MB)</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          {preview && (
            <button type="button" onClick={() => { setPoster(null); setPreview(null); }}
              className="mt-2 text-xs text-gray-400 hover:text-red-400 flex items-center gap-1">
              <X size={12} /> Remove
            </button>
          )}
        </div>

        {/* Basic Info */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Event Title *</label>
            <input required className="input-field" placeholder="e.g. TechFest 2025"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description *</label>
            <textarea required className="input-field resize-none" rows={4} placeholder="Describe your event..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => set('category', c)}
                  className={`badge-chip capitalize text-sm border transition-all ${form.category === c
                    ? 'bg-primary-600 border-primary-500 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary-500/40'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date, Venue, Capacity */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date & Time *</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input required type="datetime-local" className="input-field pl-9"
                  value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Date & Time</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="datetime-local" className="input-field pl-9"
                  value={form.endDate} onChange={e => set('endDate', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Venue *</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input required className="input-field pl-9" placeholder="e.g. Main Auditorium"
                  value={form.venue} onChange={e => set('venue', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Capacity *</label>
              <div className="relative">
                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input required type="number" min="1" className="input-field pl-9" placeholder="e.g. 200"
                  value={form.capacity} onChange={e => set('capacity', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Registration Deadline</label>
              <input type="datetime-local" className="input-field"
                value={form.registrationDeadline} onChange={e => set('registrationDeadline', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tags (comma-separated)</label>
              <div className="relative">
                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input className="input-field pl-9" placeholder="hackathon, coding, fun"
                  value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Paid Event */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <input type="checkbox" id="isPaid" checked={form.isPaid} onChange={e => set('isPaid', e.target.checked)}
              className="w-5 h-5 rounded accent-primary-600 cursor-pointer" />
            <label htmlFor="isPaid" className="font-semibold cursor-pointer">Paid Event</label>
          </div>
          {form.isPaid && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
              <input type="number" min="0" className="input-field max-w-xs" placeholder="e.g. 299"
                value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '🚀 Publish Event'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-8">Cancel</button>
        </div>
      </form>
    </div>
  );
}
