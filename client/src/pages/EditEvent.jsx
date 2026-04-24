import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../api/axios';
import { Upload, Calendar, MapPin, Users, Tag, X } from 'lucide-react';

const CATEGORIES = ['tech','cultural','sports','academic','workshop','other'];

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [poster, setPoster] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get(`/events/${id}`).then(r => {
      const e = r.data;
      setForm({
        title: e.title, description: e.description, venue: e.venue, category: e.category,
        capacity: e.capacity, tags: e.tags?.join(', ') || '', isPaid: e.isPaid, price: e.price || '',
        date: e.date ? new Date(e.date).toISOString().slice(0, 16) : '',
        status: e.status,
      });
      if (e.poster) setPreview(`http://localhost:5000${e.poster}`);
    }).catch(() => { toast.error('Event not found'); navigate('/events'); });
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setPoster(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (poster) fd.append('poster', poster);
      await API.put(`/events/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Event updated!');
      navigate(`/events/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="page-container max-w-3xl">
      <h1 className="text-3xl font-black mb-2">Edit Event</h1>
      <p className="text-gray-400 mb-8">Update your event details</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Event Poster</h2>
          <label className={`block rounded-xl border-2 border-dashed border-white/20 hover:border-primary-500/50 transition-colors cursor-pointer overflow-hidden ${preview ? 'h-48' : 'h-40'}`}>
            {preview ? <img src={preview} className="w-full h-full object-cover" alt="Preview" /> :
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500">
                <Upload size={32} /><p className="text-sm">Click to upload</p>
              </div>}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input required className="input-field" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea required className="input-field resize-none" rows={4} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => set('category', c)}
                  className={`badge-chip capitalize text-sm border transition-all ${form.category === c
                    ? 'bg-primary-600 border-primary-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary-500/40'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
              {['upcoming','ongoing','completed','cancelled'].map(s => <option key={s} value={s} className="bg-dark-800">{s}</option>)}
            </select>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date & Time</label>
              <input required type="datetime-local" className="input-field" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Venue</label>
              <div className="relative"><MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input required className="input-field pl-9" value={form.venue} onChange={e => set('venue', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Capacity</label>
              <div className="relative"><Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input required type="number" min="1" className="input-field pl-9" value={form.capacity} onChange={e => set('capacity', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tags (comma-separated)</label>
              <div className="relative"><Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input className="input-field pl-9" value={form.tags} onChange={e => set('tags', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8">
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '💾 Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-8">Cancel</button>
        </div>
      </form>
    </div>
  );
}
