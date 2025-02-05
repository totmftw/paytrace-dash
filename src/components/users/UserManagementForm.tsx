import React, { useState } from 'react';
import TextInput from './TextInput';
import SelectInput from './SelectInput';
import FormButton from './FormButton';

interface UserFormData {
  name: string;
  email: string;
  role: string;
}

interface UserManagementFormProps {
  onSubmit: (data: UserFormData) => void;
  onClose: () => void;
}

const UserManagementForm: React.FC<UserManagementFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
      <div className="flex gap-4 mt-6">
        <FormButton label="Submit" type="submit" />
        <FormButton label="Reset" type="button" onClick={handleReset} />
        <FormButton label="Close" type="button" onClick={onClose} />
      </div>
    </form>
  );
};

export default UserManagementForm;