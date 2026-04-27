import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { GRID_WIDTH, GRID_HEIGHT } from '../../../shared/constants.js';

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
  const [inventory, setInventory] = useState({
    BOMB: 0
  });

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'], // Force pure WebSocket for ultra-low latency
      upgrade: false
    });
    setSocket(newSocket);

    newSocket.on('initial_state', (data) => {
      setBlocks(data.blocks);
      setOnlineCount(data.connectedCount || 0);
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

    newSocket.on('block_captured', (data) => {
      setBlocks(prev => ({
        ...prev,
        [`${data.x},${data.y}`]: data
      }));
      setRecentCapture(`${data.x},${data.y}`);
      setTimeout(() => setRecentCapture(null), 500);
    });

    newSocket.on('user_joined', (data) => {
      setOnlineCount(data.onlineCount);
    });

    newSocket.on('user_left', (data) => {
      setOnlineCount(data.onlineCount);
    });

    newSocket.on('error', (data) => {
      addToast(data.message, 'error');
    });
    
    newSocket.on('powerup_received', (data) => {
      setInventory(prev => ({
        ...prev,
        [data.type]: (prev[data.type] || 0) + 1
      }));
      addToast(`Received Power-up: ${data.type}!`, 'success');
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

  const captureBlock = useCallback((x, y) => {
    if (!user) {
      setShowRegisterModal(true);
      return;
    }
    if (cooldown > 0) return;
    
    // OPTIMISTIC UPDATE: Reflect change instantly before server responds
    const optimisticBlock = {
      x, y, userId: user.id, username: user.username, color: user.color, isOptimistic: true
    };
    setBlocks(prev => ({
      ...prev,
      [`${x},${y}`]: optimisticBlock
    }));

    socket.emit('capture_block', { x, y });
    setCooldown(CAPTURE_COOLDOWN); 
  }, [user, cooldown, socket]);

  const useBomb = (x, y) => {
    if (inventory.BOMB <= 0) return;
    socket.emit('use_bomb', { x, y });
    setInventory(prev => ({ ...prev, BOMB: prev.BOMB - 1 }));
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
    captureBlock,
    useBomb,
    inventory,
    cooldown
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => useContext(GameContext);