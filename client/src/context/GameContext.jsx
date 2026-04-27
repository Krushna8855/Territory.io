import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { GRID_W, GRID_H, RECHARGE_MS, BONUSES } from '../../../shared/constants.js';

const GameContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3001');

export const GameProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [blocks, setBlocks] = useState({});
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentCapture, setRecentCapture] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [powerups, setPowerups] = useState({ BOMB: 0, SHIELD: 0 });
  const [activityFeed, setActivityFeed] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'], // Allow fallback for better reliability
    });
    setSocket(newSocket);

    newSocket.on('initial_state', (data) => {
      console.log('📦 State received:', data);
      // Correct mapping: data.grid is { blocks, width, height }
      setBlocks(data.grid?.blocks || {});
      setLeaderboard(data.leaderboard || []);
      setOnlineCount(data.onlineCount || 0);
      setIsLoading(false);
    });

    newSocket.on('registered', (userData) => {
      setUser(userData);
      localStorage.setItem('territory_user', JSON.stringify(userData));
      setShowRegisterModal(false);
      addToast(`Access granted: ${userData.username}`, 'success');
    });

    // Handle session recovery
    const savedUser = localStorage.getItem('territory_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      newSocket.emit('register', { id: parsedUser.id });
    }

    newSocket.on('tile_hit', (data) => {
      setBlocks(prev => ({
        ...prev,
        [`${data.x},${data.y}`]: {
          x: data.x,
          y: data.y,
          userId: data.uid,
          username: data.name,
          color: data.color
        }
      }));
      setRecentCapture(`${data.x},${data.y}`);
      setTimeout(() => setRecentCapture(null), 500);

      // INSTANT LEADERBOARD UPDATE
      setLeaderboard(prev => {
        let next = [...prev];
        
        // Winner gets +1
        const winnerIndex = next.findIndex(u => String(u.id) === String(data.uid));
        if (winnerIndex !== -1) {
          next[winnerIndex] = { ...next[winnerIndex], block_count: parseInt(next[winnerIndex].block_count) + 1 };
        } else {
          // If winner isn't on the board yet, add them (if board isn't full)
          if (next.length < 20) {
            next.push({ id: data.uid, username: data.name, color: data.color, block_count: 1 });
          }
        }

        // Victim gets -1
        if (data.victimId) {
          const victimIndex = next.findIndex(u => String(u.id) === String(data.victimId));
          if (victimIndex !== -1) {
            next[victimIndex] = { ...next[victimIndex], block_count: Math.max(0, parseInt(next[victimIndex].block_count) - 1) };
          }
        }

        // Sort by score immediately
        return next.sort((a, b) => b.block_count - a.block_count);
      });

      // Add to live feed
      setActivityFeed(prev => [
        {
          id: Date.now(),
          user: data.name,
          color: data.color,
          action: `claimed tile (${data.x}, ${data.y})`,
          time: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 19)
      ]);
    });

    newSocket.on('user_joined', (data) => {
      setOnlineCount(data.onlineCount);
    });

    newSocket.on('user_left', (data) => {
      setOnlineCount(data.onlineCount);
    });

    newSocket.on('alert', (data) => {
      addToast(data.msg, data.type || 'info');
    });
    
    newSocket.on('gift', (data) => {
      setPowerups(prev => ({
        ...prev,
        [data.type]: (prev[data.type] || 0) + 1
      }));
      addToast(`Bonus Received: ${data.type}!`, 'success');
    });

    newSocket.on('area_captured', (data) => {
      setBlocks(prev => {
        const next = { ...prev };
        data.blocks.forEach(b => {
          next[`${b.x},${b.y}`] = { ...data, x: b.x, y: b.y };
        });
        return next;
      });
      addToast(`${data.username} deployed a BOMB!`, 'info');
    });

    return () => newSocket.disconnect();
  }, [addToast]);

  const hitTile = useCallback((x, y) => {
    if (!user) {
      setShowRegisterModal(true);
      return;
    }
    if (cooldown > 0) return;
    
    // Tapping logic
    const pendingTap = {
      x, y, uid: user.id, name: user.username, color: user.color, isOptimistic: true
    };
    setBlocks(prev => ({
      ...prev,
      [`${x},${y}`]: pendingTap
    }));

    socket.emit('claim_tile', { x, y });
    setCooldown(RECHARGE_MS); 
  }, [user, cooldown, socket]);

  const useBomb = (x, y) => {
    if (powerups.BOMB <= 0) return;
    socket.emit('use_bomb', { x, y });
    setPowerups(prev => ({ ...prev, BOMB: prev.BOMB - 1 }));
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(prev => Math.max(0, prev - 10)), 100);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const value = {
    socket,
    blocks,
    user,
    leaderboard,
    setLeaderboard,
    onlineCount,
    isLoading,
    recentCapture,
    toasts,
    addToast,
    showRegisterModal,
    setShowRegisterModal,
    hitTile,
    useBomb,
    powerups,
    cooldown,
    activityFeed
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => useContext(GameContext);