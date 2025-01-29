import React, { useState } from 'react';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import FormButton from './FormButton';

const UserManagementForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.role) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput label="Name" name="name" value={formData.name} onChange={handleChange} />
      <TextInput label="Email" name="email" value={formData.email} onChange={handleChange} />
      <SelectInput
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ]}
      />
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <FormButton label="Submit" type="submit" />
        <FormButton label="Reset" type="button" onClick={handleReset} />
        <FormButton label="Close" type="button" onClick={onClose} />
      </div>
    </form>
  );
};

export default UserManagementForm;