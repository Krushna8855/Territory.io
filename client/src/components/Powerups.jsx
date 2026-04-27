import React from 'react';
import { useGame } from '../context/GameContext';
import { Bomb, Shield } from 'lucide-react';

const Powerups = () => {
  const { powerups } = useGame();

  if (powerups.BOMB === 0 && powerups.SHIELD === 0) return null;

  return (
    <div className="powerup-inventory">
      <div className="inventory-header">
        <span>Abilities</span>
      </div>
      <div className="inventory-slots">
        {powerups.BOMB > 0 && (
          <div className="inventory-item has-item">
            <div className="item-icon">
              <Bomb size={18} />
            </div>
            <div className="item-details">
              <span className="item-name">Bomb</span>
              <span className="item-count">x{powerups.BOMB}</span>
            </div>
            <div className="item-tip">Right-Click Grid</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Powerups;
