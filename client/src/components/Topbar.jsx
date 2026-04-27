import React from 'react';
import { useGame } from '../context/GameContext';
import { Layout, Share2, Info } from 'lucide-react';

const Topbar = () => {
  const { blocks, user } = useGame();
  const totalBlocks = Object.keys(blocks).length;

  return (
    <header className="topbar">
      <div className="brand">
        <div className="logo-sq">
          <Layout size={24} color="white" />
        </div>
        <div className="brand-text">
          <h1>Territory.io</h1>
          <p>Global Pixel War</p>
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-pill">
          <span className="pill-label">Captured</span>
          <span className="pill-value">{totalBlocks}</span>
        </div>
        <div className="stat-pill">
          <span className="pill-label">Available</span>
          <span className="pill-value">{1500 - totalBlocks}</span>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" title="Share">
          <Share2 size={20} />
        </button>
        <button className="icon-btn" title="How to Play">
          <Info size={20} />
        </button>
        {user && (
          <div className="player-profile">
            <div className="profile-text">
              <span className="p-name">{user.username}</span>
              <span className="p-status">Online</span>
            </div>
            <div className="profile-avatar" style={{ backgroundColor: user.color }}>
              {user.username[0]}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;