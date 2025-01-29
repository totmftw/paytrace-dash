import React, { useState } from 'react';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import FormButton from './FormButton';

const UserManagementForm = ({ onSubmit }) => {
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
    onSubmit(formData);
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
      <FormButton label="Submit" type="submit" />
    </form>
  );
};

export default UserManagementForm;