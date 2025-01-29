import React from 'react';

interface FormButtonProps {
  label: string;
  type: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

const FormButton: React.FC<FormButtonProps> = ({ label, type, onClick }) => (
  <button 
    type={type} 
    onClick={onClick}
    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
  >
    {label}
  </button>
);

export default FormButton;