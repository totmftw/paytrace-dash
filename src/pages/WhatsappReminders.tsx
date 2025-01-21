import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PaymentReminders } from "@/components/dashboard/PaymentReminders";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function WhatsappReminders() {
  const { toast } = useToast();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [whatsappConfig, setWhatsappConfig] = useState({
    apiKey: '',
    templateNamespace: '',
    templateName: '',
    fromPhoneNumberId: ''
  });

  const handleConfigureWhatsApp = async () => {
    try {
      setIsConfiguring(true);
      const { error } = await supabase.functions.invoke('update-whatsapp-config', {
        body: whatsappConfig
      });

      if (error) throw error;

      toast({
        title: "WhatsApp Configuration Updated",
        description: "Your WhatsApp API configuration has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating WhatsApp config:', error);
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Failed to update WhatsApp configuration. Please try again.",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">WhatsApp Reminders</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configure WhatsApp API
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>WhatsApp API Configuration</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={whatsappConfig.apiKey}
                  onChange={(e) => setWhatsappConfig(prev => ({
                    ...prev,
                    apiKey: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="templateNamespace">Template Namespace</Label>
                <Input
                  id="templateNamespace"
                  value={whatsappConfig.templateNamespace}
                  onChange={(e) => setWhatsappConfig(prev => ({
                    ...prev,
                    templateNamespace: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={whatsappConfig.templateName}
                  onChange={(e) => setWhatsappConfig(prev => ({
                    ...prev,
                    templateName: e.target.value
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fromPhoneNumberId">From Phone Number ID</Label>
                <Input
                  id="fromPhoneNumberId"
                  value={whatsappConfig.fromPhoneNumberId}
                  onChange={(e) => setWhatsappConfig(prev => ({
                    ...prev,
                    fromPhoneNumberId: e.target.value
                  }))}
                />
              </div>
            </div>
            <Button onClick={handleConfigureWhatsApp} disabled={isConfiguring}>
              {isConfiguring ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      
      <PaymentReminders />
    </div>
  );
}