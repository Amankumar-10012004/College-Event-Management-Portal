import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const CATEGORY_STYLES = {
  tech: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  cultural: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  sports: 'bg-green-500/20 text-green-300 border-green-500/30',
  academic: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  workshop: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  other: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

const STATUS_STYLES = {
  upcoming: 'bg-emerald-500/20 text-emerald-400',
  ongoing: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const CATEGORY_ICONS = {
  tech: '💻', cultural: '🎭', sports: '🏆', academic: '📚', workshop: '🔧', other: '🎪',
};

export default function EventCard({ event }) {
  const spotsLeft = event.capacity - event.totalRegistrations;
  const isFull = spotsLeft <= 0;
  const isUrgent = spotsLeft <= 5 && spotsLeft > 0;

  return (
    <Link to={`/events/${event._id}`} className="block group">
      <div className="glass rounded-2xl overflow-hidden transition-all duration-300
                      hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-600/10
                      hover:-translate-y-1 h-full flex flex-col">
        {/* Poster */}
        <div className="relative h-44 bg-gradient-to-br from-dark-700 to-dark-800 overflow-hidden">
          {event.poster ? (
            <img
              src={`http://localhost:5000${event.poster}`}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {CATEGORY_ICONS[event.category] || '🎪'}
            </div>
          )}
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            <span className={`badge-chip border text-xs ${CATEGORY_STYLES[event.category]}`}>
              {CATEGORY_ICONS[event.category]} {event.category}
            </span>
            {event.isPaid && (
              <span className="badge-chip bg-amber-500/20 text-amber-300 border border-amber-500/30">
                💳 ₹{event.price}
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <span className={`badge-chip text-xs ${STATUS_STYLES[event.status]}`}>
              {event.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-white text-lg leading-snug mb-2 line-clamp-2 group-hover:text-primary-300 transition-colors">
            {event.title}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>

          <div className="space-y-1.5 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-primary-400 shrink-0" />
              <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary-400 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className={isFull ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-primary-400'} />
              <span className={isFull ? 'text-red-400' : isUrgent ? 'text-amber-400' : ''}>
                {isFull ? 'Full – Waitlist' : `${spotsLeft} spots left`}
              </span>
            </div>
          </div>

          {/* Organizer */}
          {event.organizer && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
              <div className="w-6 h-6 bg-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                {event.organizer.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs text-gray-500">{event.organizer.name}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
