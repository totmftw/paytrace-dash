import React from 'react';

const SelectInput = ({ label, name, value, onChange, options }) => (
  <div>
    <label>{label}</label>
    <select name={name} value={value} onChange={onChange}>
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectInput;