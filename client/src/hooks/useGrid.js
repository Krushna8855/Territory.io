import { useGame } from '../context/GameContext';

export const useGrid = () => {
  const { blocks, isLoading, recentCapture, captureBlock } = useGame();
  return { blocks, isLoading, recentCapture, captureBlock };
};