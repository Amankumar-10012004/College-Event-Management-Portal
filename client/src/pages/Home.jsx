import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/axios';
import EventCard from '../components/EventCard';

const STATS = [
  { icon: Calendar, label: 'Events Hosted', value: '500+' },
  { icon: Users, label: 'Students Engaged', value: '10K+' },
  { icon: Star, label: 'Avg Rating', value: '4.8★' },
  { icon: Zap, label: 'Colleges', value: '25+' },
];

const CATEGORIES = [
  { name: 'tech', icon: '💻', label: 'Technology', color: 'from-blue-600/30 to-blue-800/10 border-blue-500/20' },
  { name: 'cultural', icon: '🎭', label: 'Cultural', color: 'from-purple-600/30 to-purple-800/10 border-purple-500/20' },
  { name: 'sports', icon: '🏆', label: 'Sports', color: 'from-green-600/30 to-green-800/10 border-green-500/20' },
  { name: 'academic', icon: '📚', label: 'Academic', color: 'from-yellow-600/30 to-yellow-800/10 border-yellow-500/20' },
  { name: 'workshop', icon: '🔧', label: 'Workshop', color: 'from-orange-600/30 to-orange-800/10 border-orange-500/20' },
  { name: 'other', icon: '🎪', label: 'Other', color: 'from-pink-600/30 to-pink-800/10 border-pink-500/20' },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function Home() {
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    API.get('/events/upcoming').then(r => setUpcoming(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>
        <motion.div
          className="max-w-4xl mx-auto text-center relative"
          initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.15 } } }}>
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-primary-300 text-sm font-medium mb-6">
            <Zap size={14} className="text-primary-400" />
            The #1 College Event Platform
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Discover <span className="gradient-text">Amazing</span>
            <br />Campus Events
          </motion.h1>
          <motion.p variants={fadeUp} className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Register for events, earn points, unlock badges, and make the most of your college life.
          </motion.p>
          <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
            <Link to="/events" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
              Explore Events <ArrowRight size={20} />
            </Link>
            <Link to="/register" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4">
              Join Free
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="card text-center group hover:border-primary-500/40">
              <Icon size={28} className="text-primary-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-black gradient-text mb-1">{value}</div>
              <div className="text-sm text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-title text-center">Browse by Category</h2>
          <p className="section-subtitle text-center">Find events that match your interests</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ name, icon, label, color }) => (
              <Link key={name} to={`/events?category=${name}`}
                className={`glass rounded-2xl p-6 text-center bg-gradient-to-b ${color} border
                            hover:-translate-y-1 transition-all duration-300 group`}>
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
                <div className="text-sm font-semibold text-white">{label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">Upcoming Events</h2>
              <p className="text-gray-400">Don't miss what's happening on campus</p>
            </div>
            <Link to="/events" className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-30" />
              <p>No upcoming events yet. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map(event => <EventCard key={event._id} event={event} />)}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-primary-500/20">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-4xl font-black mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">Join thousands of students discovering amazing campus events</p>
          <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2">
            Create Your Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
