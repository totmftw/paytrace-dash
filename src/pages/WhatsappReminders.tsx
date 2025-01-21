import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PaymentReminders } from "@/components/dashboard/PaymentReminders";
import { Settings } from "lucide-react";

export default function WhatsappReminders() {
  const { toast } = useToast();

  const handleConfigureWhatsApp = () => {
    toast({
      title: "WhatsApp Configuration",
      description: "WhatsApp API configuration will be implemented soon.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">WhatsApp Reminders</h1>
        <Button 
          onClick={handleConfigureWhatsApp}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Configure WhatsApp API
        </Button>
      </div>
      
      <PaymentReminders />
    </div>
  );
}