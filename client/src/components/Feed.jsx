import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Activity } from 'lucide-react';

const Feed = () => {
  const { socket } = useGame();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleCapture = (data) => {
      const newEvent = {
        id: Date.now(),
        message: `${data.username} captured block (${data.x}, ${data.y})`,
        color: data.color,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 5));
    };

    socket.on('block_captured', handleCapture);
    return () => socket.off('block_captured', handleCapture);
  }, [socket]);

  return (
    <div className="activity-feed">
      <div className="feed-header">
        <Activity size={14} />
        <span>Live Feed</span>
      </div>
      <div className="feed-list">
        {events.map(event => (
          <div key={event.id} className="feed-item animate-slide-in">
            <div className="feed-dot" style={{ backgroundColor: event.color }}></div>
            <span className="feed-msg">{event.message}</span>
            <span className="feed-time">{event.time}</span>
          </div>
        ))}
        {events.length === 0 && <p className="feed-empty">Waiting for actions...</p>}
      </div>
    </div>
  );
};

export default Feed;