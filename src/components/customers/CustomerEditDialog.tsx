import React from 'react';
import { Dialog, DialogTitle, DialogActions, DialogContent, Button } from '@mui/material';
import useCustomerEditForm from './hooks/useCustomerEditForm';
import InputField from './components/InputField';

interface CustomerEditDialogProps {
  open: boolean;
  onClose: () => void;
  customer: { id: string; name: string; email: string; phone: string } | null;
  onSave: (data: { id: string; name: string; email: string; phone: string }) => void;
}

const CustomerEditDialog: React.FC<CustomerEditDialogProps> = ({ open, onClose, customer, onSave }) => {
  const { formValues, handleInputChange, handleSubmit, isValid } = useCustomerEditForm(customer, onSave);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Customer</DialogTitle>
      <DialogContent>
        <InputField
          label="Name"
          name="name"
          value={formValues.name}
          onChange={handleInputChange}
        />
        <InputField
          label="Email"
          name="email"
          value={formValues.email}
          onChange={handleInputChange}
          type="email"
        />
        <InputField
          label="Phone"
          name="phone"
          value={formValues.phone}
          onChange={handleInputChange}
          type="tel"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={!isValid()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerEditDialog;