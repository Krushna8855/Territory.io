import React from 'react';

const Input = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, error }) => {
  return (
    <div className="shared-input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={error ? 'has-error' : ''}
        />
        {Icon && <Icon size={16} className="input-icon" />}
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
};

export default Input;
