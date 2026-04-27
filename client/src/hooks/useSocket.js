import { useGame } from '../context/GameContext';

export const useSocket = () => {
  const { socket, onlineCount } = useGame();
  return { socket, onlineCount };
};