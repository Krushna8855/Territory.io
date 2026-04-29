import React from 'react';
import Cell from './Cell';
import { GRID_W, GRID_H } from '../../../../shared/constants.js';
import { useGame } from '../../context/GameContext';

const Grid = () => {
  const context = useGame();
  
  // Early exit if context is not yet available
  if (!context) return null;

  const { blocks = {}, isLoading, recentCapture, user, hitTile, useBomb, leaderboard = [] } = context;

  if (isLoading) {
    return (
      <div className="grid-loading">
        <div className="spinner"></div>
        <p>Syncing Territory...</p>
      </div>
    );
  }

  const cells = [];
  const top3Ids = leaderboard?.slice(0, 3).map(u => String(u.id)) || [];

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const key = `${x},${y}`;
      const block = blocks ? blocks[key] : null;
      cells.push(
        <Cell 
          key={key} 
          x={x} 
          y={y} 
          block={block}
          isRecent={recentCapture === key}
          isMine={block?.userId === user?.id}
          isKing={block && top3Ids.includes(String(block.userId))}
          onHit={hitTile}
          onBomb={useBomb}
        />
      );
    }
  }

  return (
    <div 
      className="grid-canvas"
      style={{
        gridTemplateColumns: `repeat(${GRID_W}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_H}, 1fr)`,
      }}
    >
      {cells}
    </div>
  );
};

export default Grid;