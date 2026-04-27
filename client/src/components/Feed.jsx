import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Activity } from 'lucide-react';

const Feed = () => {
  const { activityFeed } = useGame();

  return (
    <div className="activity-feed">
      <div className="feed-header">
        <Activity size={14} />
        <span>Live Feed</span>
      </div>
      <div className="feed-list">
        {activityFeed.map(event => (
          <div key={event.id} className="feed-item animate-slide-in">
            <div className="feed-dot" style={{ backgroundColor: event.color }}></div>
            <span className="feed-msg">
              <strong>{event.user}</strong> {event.action}
            </span>
            <span className="feed-time">{event.time}</span>
          </div>
        ))}
        {activityFeed.length === 0 && <p className="feed-empty">Waiting for actions...</p>}
      </div>
    </div>
  );
};

export default Feed;