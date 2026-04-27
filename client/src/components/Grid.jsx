import React from 'react';
import Cell from './Cell';
import { GRID_WIDTH, GRID_HEIGHT } from '../../../shared/constants.js';
import { useGame } from '../context/GameContext';

const Grid = () => {
  const { blocks, isLoading, recentCapture, user, captureBlock, useBomb } = useGame();

  if (isLoading) {
    return (
      <div className="grid-loading">
        <div className="spinner"></div>
        <p>Syncing Territory...</p>
      </div>
    );
  }

  const cells = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const key = `${x},${y}`;
      cells.push(
        <Cell 
          key={key} 
          x={x} 
          y={y} 
          block={blocks[key]}
          isRecent={recentCapture === key}
          isMine={blocks[key]?.userId === user?.id}
          onCapture={captureBlock}
          onBomb={useBomb}
        />
      );
    }
  }

  return (
    <div 
      className="grid-canvas"
      style={{
        gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
      }}
    >
      {cells}
    </div>
  );
};

export default Grid;