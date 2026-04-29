import React, { useState } from 'react';
import { User, Lock, Palette, Rocket } from 'lucide-react';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { COLORS } from '../../../../shared/constants';

const RegisterForm = ({ onRegister, isConnecting }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    color: COLORS[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      alert('Username and Password are required!');
      return;
    }
    onRegister(formData);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <Input
        label="Username"
        icon={User}
        placeholder="Choose your Username..."
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />

      <Input
        label="Password"
        type="password"
        icon={Lock}
        placeholder="Create a password..."
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />

      <div className="color-selection">
        <label className="input-label">Choose Your Color</label>
        <div className="color-grid">
          {COLORS.map(c => (
            <div
              key={c}
              className={`color-pill ${formData.color === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setFormData({ ...formData, color: c })}
            />
          ))}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        icon={Rocket}
        className="w-full mt-4"
        disabled={isConnecting}
      >
        {isConnecting ? 'Syncing...' : 'Join the War'}
      </Button>
    </form>
  );
};

export default RegisterForm;
