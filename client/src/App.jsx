import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Topbar from './components/Topbar';
import Grid from './components/Grid';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Powerups from './components/Powerups';
import Cooldown from './components/Cooldown';
import { USER_COLORS } from '../../shared/constants.js';
import { Play, X } from 'lucide-react';

const GameContent = () => {
  const { showRegisterModal, setShowRegisterModal, user, socket, toasts } = useGame();
  const [username, setUsername] = useState('');
  const [selectedColor, setSelectedColor] = useState(USER_COLORS[0]);

  const handleRegister = () => {
    if (!username.trim()) return;
    socket?.emit('register', { username: username.trim(), color: selectedColor });
  };

  return (
    <div className="app-layout">
      <Topbar />
      
      <main className="game-container">
        <div className="map-section">
          <div className="map-card">
            <Grid />
          </div>
          <Feed />
        </div>
        <div className="sidebar-column">
          <Sidebar />
          <Powerups />
        </div>
      </main>
      <Cooldown />

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="header-flex">
                <h2>Join the War</h2>
                <button className="close-btn" onClick={() => setShowRegisterModal(false)}>
                  <X size={20} />
                </button>
              </div>
              {!user && <p>Claim your territory in the global grid</p>}
            </div>
            
            <div className="modal-body">
              <div className="input-field">
                <label>Vessel Name</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username..."
                  autoFocus
                />
              </div>

              <div className="color-selector">
                <label>Signature Color</label>
                <div className="color-grid">
                  {USER_COLORS.map(c => (
                    <button 
                      key={c}
                      className={`color-pill ${selectedColor === c ? 'active' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setSelectedColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="primary-btn" onClick={handleRegister}>
                <Play size={18} />
                <span>Initialize Core</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast System */}
      <div className="toasts">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
