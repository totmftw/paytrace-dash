import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Invoice } from '@/types/dashboard';

interface ReminderMessageFormProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reminderNumber: number;
}

export function ReminderMessageForm({ 
  invoice, 
  isOpen, 
  onClose, 
  onSuccess,
  reminderNumber 
}: ReminderMessageFormProps) {
  const [message, setMessage] = React.useState(
    `Dear ${invoice.customerMaster.custBusinessname},\n\nThis is a reminder for the payment of invoice ${invoice.invNumber} for amount ₹${invoice.invTotal.toLocaleString()}. Please process the payment at your earliest convenience.\n\nThank you.`
  );

  const handleSend = async () => {
    try {
      // Here you would implement the actual sending logic
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Payment Reminder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[200px]"
          />
          <Button onClick={handleSend}>Send Reminder</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}