import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import API from '../api/axios';
import EventCard from '../components/EventCard';

const CATEGORIES = ['tech', 'cultural', 'sports', 'academic', 'workshop', 'other'];
const STATUSES = ['upcoming', 'ongoing', 'completed'];

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState('upcoming');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      const res = await API.get('/events', { params });
      setEvents(res.data.events);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [page, category, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const clearFilters = () => { setCategory(''); setStatus('upcoming'); setSearch(''); setPage(1); };

  return (
    <div className="page-container">
      <h1 className="text-4xl font-black mb-2">All Events</h1>
      <p className="text-gray-400 mb-8">{total} events found</p>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input placeholder="Search events..." className="input-field pl-11"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
        </form>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
          <Filter size={18} /> Filters {(category || status !== 'upcoming') && <span className="w-2 h-2 bg-primary-400 rounded-full" />}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass rounded-2xl p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
              <X size={14} /> Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400 mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => { setCategory(category === c ? '' : c); setPage(1); }}
                    className={`badge-chip capitalize text-xs font-medium border transition-all ${category === c
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary-500/50'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-3">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => { setStatus(status === s ? '' : s); setPage(1); }}
                    className={`badge-chip capitalize text-xs font-medium border transition-all ${status === s
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-primary-500/50'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <Search size={56} className="mx-auto mb-4 opacity-20" />
          <p className="text-xl">No events found</p>
          <p className="text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => <EventCard key={event._id} event={event} />)}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {[...Array(pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${page === i + 1
                ? 'bg-primary-600 text-white'
                : 'glass text-gray-400 hover:text-white'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
