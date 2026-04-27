import React from 'react';
import Cell from './Cell';
import { GRID_W, GRID_H } from '../../../shared/constants.js';
import { useGame } from '../context/GameContext';

const Grid = () => {
  const { blocks = {}, isLoading, recentCapture, user, hitTile, useBomb } = useGame();

  if (isLoading) {
    return (
      <div className="grid-loading">
        <div className="spinner"></div>
        <p>Syncing Territory...</p>
      </div>
    );
  }

  const cells = [];
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const key = `${x},${y}`;
      cells.push(
        <Cell 
          key={key} 
          x={x} 
          y={y} 
          block={blocks ? blocks[key] : null}
          isRecent={recentCapture === key}
          isMine={blocks && blocks[key]?.userId === user?.id}
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