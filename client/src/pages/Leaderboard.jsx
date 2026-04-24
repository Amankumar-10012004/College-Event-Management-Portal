import { useState, useEffect } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const RANK_STYLES = [
  'text-amber-400 bg-amber-500/20 border-amber-500/30',
  'text-gray-300 bg-gray-500/20 border-gray-500/30',
  'text-orange-400 bg-orange-500/20 border-orange-500/30',
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/users').then(r => {
      const sorted = [...r.data].sort((a, b) => (b.points || 0) - (a.points || 0));
      setUsers(sorted);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const myRank = user ? users.findIndex(u => u._id === user._id) + 1 : 0;

  return (
    <div className="page-container max-w-3xl">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl font-black mb-2">Leaderboard</h1>
        <p className="text-gray-400">Top students by event participation points</p>
        {myRank > 0 && (
          <div className="inline-flex items-center gap-2 mt-4 glass px-4 py-2 rounded-full border border-primary-500/30">
            <Star size={16} className="text-primary-400" />
            <span className="text-sm">Your rank: <strong className="text-primary-300">#{myRank}</strong></span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="glass rounded-xl h-16 animate-pulse" />)}</div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {users.map((u, i) => (
            <div key={u._id}
              className={`flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${u._id === user?._id ? 'bg-primary-600/10' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border ${i < 3 ? RANK_STYLES[i] : 'bg-white/5 text-gray-400 border-white/10'}`}>
                {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
              </div>
              <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center font-bold">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">
                  {u.name} {u._id === user?._id && <span className="text-primary-400 text-xs">(You)</span>}
                </p>
                <p className="text-xs text-gray-400">{u.department || 'Student'}</p>
              </div>
              {u.badges?.length > 0 && (
                <div className="hidden md:flex gap-1">
                  {u.badges.slice(0, 3).map((b, j) => <span key={j} title={b.name} className="text-lg">{b.icon}</span>)}
                </div>
              )}
              <div className="text-right">
                <div className="font-black text-primary-300">{u.points || 0}</div>
                <div className="text-xs text-gray-500">pts</div>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Trophy size={40} className="mx-auto mb-3 opacity-30" />
              <p>No data yet. Start registering for events!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
