import { useGame } from '../context/GameContext';

export const usePlayer = () => {
  const { user, showRegisterModal, setShowRegisterModal, socket } = useGame();
  
  const register = (username, color) => {
    socket?.emit('register', { username, color });
  };

  return { user, showRegisterModal, setShowRegisterModal, register };
};