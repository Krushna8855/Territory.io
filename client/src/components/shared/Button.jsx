import React from 'react';

const Button = ({ children, onClick, disabled, variant = 'primary', icon: Icon, className = '', type = 'button' }) => {
  return (
    <button
      type={type}
      className={`shared-btn ${variant} ${disabled ? 'disabled' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={18} className="btn-icon" />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
