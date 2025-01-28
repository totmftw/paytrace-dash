import React from 'react';
import { TextField } from '@mui/material';

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; // Optional type (e.g., "email", "tel", "text")
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text' }) => {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
      fullWidth
      margin="normal"
    />
  );
};

export default InputField;