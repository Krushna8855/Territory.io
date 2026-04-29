import React, { memo } from 'react';
import { Crown } from 'lucide-react';

const Cell = memo(({ x, y, block, isRecent, isMine, isKing, onHit, onBomb }) => {
  const isOwned = !!block;

  return (
    <div
      className={`cell ${isOwned ? 'owned' : ''} ${isRecent ? 'just-captured' : ''} ${isMine ? 'mine' : ''} ${isKing ? 'is-king' : ''}`}
      style={{
        backgroundColor: isOwned ? block.color : 'transparent',
        '--cell-color': block?.color
      }}
      onClick={() => onHit(x, y)}
      onContextMenu={(e) => {
        e.preventDefault();
        onBomb(x, y);
      }}
    >
      {isKing && <Crown size={10} className="king-crown" />}
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