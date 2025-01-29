import React from 'react';

const FormButton = ({ label, type, onClick }) => (
  <button type={type} onClick={onClick}>
    {label}
  </button>
);

export default FormButton;