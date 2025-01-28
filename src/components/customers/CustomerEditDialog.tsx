import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from '@/types/customer';

interface CustomerEditDialogProps {
  customer: Customer | null;
  onClose: () => void;
  onSave: () => void;
}

export function CustomerEditDialog({ customer, onClose, onSave }: CustomerEditDialogProps) {
  const [formData, setFormData] = React.useState({
    custBusinessname: customer?.custBusinessname || '',
    custOwnername: customer?.custOwnername || '',
    custPhone: customer?.custPhone?.toString() || '',
    custWhatsapp: customer?.custWhatsapp?.toString() || '',
    custEmail: customer?.custEmail || '',
    custType: customer?.custType || '',
    custAddress: customer?.custAddress || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('customerMaster')
        .update({
          custBusinessname: formData.custBusinessname,
          custOwnername: formData.custOwnername,
          custPhone: parseInt(formData.custPhone),
          custWhatsapp: parseInt(formData.custWhatsapp),
          custEmail: formData.custEmail,
          custType: formData.custType,
          custAddress: formData.custAddress,
        })
        .eq('id', customer?.id);

      if (error) throw error;
      onSave();
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  return (
    <Dialog open={Boolean(customer)} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="businessName" className="text-right">Business Name</Label>
            <Input
              id="businessName"
              name="custBusinessname"
              value={formData.custBusinessname}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ownerName" className="text-right">Owner Name</Label>
            <Input
              id="ownerName"
              name="custOwnername"
              value={formData.custOwnername}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">Phone</Label>
            <Input
              id="phone"
              name="custPhone"
              type="tel"
              value={formData.custPhone}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="whatsapp" className="text-right">WhatsApp</Label>
            <Input
              id="whatsapp"
              name="custWhatsapp"
              type="tel"
              value={formData.custWhatsapp}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input
              id="email"
              name="custEmail"
              type="email"
              value={formData.custEmail}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}