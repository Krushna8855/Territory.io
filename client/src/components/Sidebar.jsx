import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Users, Shield, Zap } from 'lucide-react';

const Sidebar = () => {
  const { leaderboard, setLeaderboard, onlineCount, user, blocks } = useGame();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [setLeaderboard]);

  const userBlocks = Object.values(blocks).filter(b => b.userId === user?.id).length;

  return (
    <aside className="sidebar">
      <div className="stats-card">
        <div className="stat-item">
          <Users size={20} color="#60a5fa" />
          <div className="stat-info">
            <span className="stat-label">Online</span>
            <span className="stat-value">{onlineCount}</span>
          </div>
        </div>
        <div className="stat-item">
          <Shield size={20} color="#4ade80" />
          <div className="stat-info">
            <span className="stat-label">Your Territory</span>
            <span className="stat-value">{userBlocks}</span>
          </div>
        </div>
      </div>

      <div className="leaderboard-panel">
        <div className="panel-header">
          <Trophy size={18} />
          <h3>Leaderboard</h3>
        </div>
        <div className="leaderboard-list">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className={`leaderboard-row ${String(entry.id) === String(user?.id) ? 'is-me' : ''}`}>
              <div className="rank">
                <span className={`rank-num rank-${index + 1}`}>#{index + 1}</span>
              </div>
              <div className="user-avatar" style={{ backgroundColor: entry.color }}>
                <span>{entry.username[0].toUpperCase()}</span>
              </div>
              <div className="user-meta">
                <span className="username">{entry.username}</span>
                <span className="count">{entry.block_count} <span className="unit">blocks</span></span>
              </div>
              {index < 3 && <Zap size={14} className={`top-badge badge-${index + 1}`} />}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;