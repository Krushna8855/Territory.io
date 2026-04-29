import React, { useState } from 'react';
import { User, Lock, Key } from 'lucide-react';
import Input from '../shared/Input';
import Button from '../shared/Button';

const LoginForm = ({ onLogin, isConnecting }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      alert('Username and Password are required!');
      return;
    }
    onLogin(formData);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <Input
        label="Username"
        icon={User}
        placeholder="Enter your username..."
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />

      <Input
        label="Secret Key"
        type="password"
        icon={Lock}
        placeholder="Enter your password..."
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />

      <Button
        type="submit"
        variant="primary"
        icon={Key}
        className="w-full mt-4"
        disabled={isConnecting}
      >
        {isConnecting ? 'Authenticating...' : 'Enter in Territory'}
      </Button>
    </form>
  );
};

export default LoginForm;
