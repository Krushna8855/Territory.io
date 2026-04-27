import React from 'react';
import { useGame } from '../context/GameContext';
import { Timer } from 'lucide-react';
import { RECHARGE_MS } from '../../../shared/constants';

const Cooldown = () => {
  const { cooldown } = useGame();

  if (cooldown === 0) return null;

  return (
    <div className="cooldown-overlay">
      <div className="cooldown-card">
        <Timer size={18} className="animate-spin-slow" />
        <div className="progress-bg">
          <div 
            className="progress-fill" 
            style={{ width: `${(cooldown / RECHARGE_MS) * 100}%` }}
          ></div>
        </div>
        <span className="cooldown-text">RECHARGING...</span>
      </div>
    </div>
  );
};

export default Cooldown;