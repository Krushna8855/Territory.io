import React, { memo } from 'react';

const Cell = memo(({ x, y, block, isRecent, isMine, onCapture, onBomb }) => {
  const isOwned = !!block;

  return (
    <div
      className={`cell ${isOwned ? 'owned' : ''} ${isRecent ? 'just-captured' : ''} ${isMine ? 'mine' : ''}`}
      style={{
        backgroundColor: isOwned ? block.color : 'transparent',
        '--cell-color': block?.color
      }}
      onClick={() => onCapture(x, y)}
      onContextMenu={(e) => {
        e.preventDefault();
        onBomb(x, y);
      }}
    >
      {isOwned && (
        <div className="cell-tooltip">
          <span className="tooltip-user">{block.username}</span>
          <span className="tooltip-pos">({x}, {y})</span>
        </div>
      )}
    </div>
  );
});

export default Cell;