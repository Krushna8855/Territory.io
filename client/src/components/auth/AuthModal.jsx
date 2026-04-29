import React, { useState } from 'react';
import Modal from '../shared/Modal';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import { useGame } from '../../context/GameContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('register'); // 'register' or 'login'
  const { socket, user, isConnected } = useGame();

  const handleAuth = (data) => {
    socket?.emit('register', {
      ...data,
      color: mode === 'login' ? null : data.color
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={user ? onClose : null} // Can't close if not logged in
      title={mode === 'register' ? 'Register' : 'Commander Join'}
      subtitle={mode === 'register' ? 'Claim your territory in the global grid' : 'Return to your empire'}
    >
      <div className="auth-tabs">
        <button
          className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
        <button
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => setMode('login')}
        >
          Join
        </button>
      </div>

      {mode === 'register' ? (
        <RegisterForm onRegister={handleAuth} isConnecting={!isConnected} />
      ) : (
        <LoginForm onLogin={handleAuth} isConnecting={!isConnected} />
      )}
    </Modal>
  );
};

export default AuthModal;
