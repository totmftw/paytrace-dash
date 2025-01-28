import { useState } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const useCustomerEditForm = (
  customer: Customer | null,
  onSave: (data: Customer) => void
) => {
  const [formValues, setFormValues] = useState({
    name: customer ? customer.name : '',
    email: customer ? customer.email : '',
    phone: customer ? customer.phone : '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (isValid()) {
      onSave(formValues);
    } else {
      alert('All fields are required');
    }
  };

  const isValid = () => {
    return formValues.name.trim() !== '' &&
           formValues.email.trim() !== '' &&
           formValues.phone.trim() !== '';
  };

  return { formValues, handleInputChange, handleSubmit, isValid };
};

export default useCustomerEditForm;