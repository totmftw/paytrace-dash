import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReminderMessageFormProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSend: () => void;
}

export function ReminderMessageForm({ message, onMessageChange, onSend }: ReminderMessageFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Reminder Message</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Enter your reminder message..."
            className="min-h-[100px]"
          />
          <Button onClick={onSend}>Send Reminder</Button>
        </div>
      </CardContent>
    </Card>
  );
}