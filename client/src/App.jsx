import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Topbar from './components/layout/Topbar';
import Grid from './components/game/Grid';
import Sidebar from './components/layout/Sidebar';
import Feed from './components/layout/Feed';
import Powerups from './components/game/Powerups';
import Cooldown from './components/game/Cooldown';
import AuthModal from './components/auth/AuthModal';
import MatrixBackground from './components/shared/MatrixBackground';

const GameContent = () => {
  const { showRegisterModal, setShowRegisterModal, toasts } = useGame();

  return (
    <div className="app-layout">
      <MatrixBackground />
      <Topbar />
      
      <main className="game-container">
        <div className="map-section">
          <div className="map-card">
            <Grid />
          </div>
        </div>
        <div className="sidebar-column">
          <Sidebar />
          <Powerups />
        </div>
      </main>
      
      <Cooldown />
      <AuthModal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} />

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
