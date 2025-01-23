import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PaymentReminders } from "@/components/dashboard/PaymentReminders";
import { Settings, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function WhatsappReminders() {
  const { toast } = useToast();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [whatsappConfig, setWhatsappConfig] = useState({
    apiKey: '',
    templateNamespace: '',
    templateName: '',
    fromPhoneNumberId: ''
  });

  // Fetch existing WhatsApp configuration
  const { data: existingConfig, refetch: refetchConfig } = useQuery({
    queryKey: ["whatsapp-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (existingConfig) {
      setWhatsappConfig({
        apiKey: existingConfig.api_key,
        templateNamespace: existingConfig.template_namespace,
        templateName: existingConfig.template_name,
        fromPhoneNumberId: existingConfig.from_phone_number_id
      });
    }
  }, [existingConfig]);

  const handleConfigureWhatsApp = async () => {
    try {
      setIsConfiguring(true);
      
      const { error } = await supabase
        .from('whatsapp_config')
        .insert({
          api_key: whatsappConfig.apiKey,
          template_namespace: whatsappConfig.templateNamespace,
          template_name: whatsappConfig.templateName,
          from_phone_number_id: whatsappConfig.fromPhoneNumberId
        });

      if (error) throw error;

      toast({
        title: "WhatsApp Configuration Updated",
        description: "Your WhatsApp API configuration has been saved successfully.",
      });

      refetchConfig();
      setIsDialogOpen(false);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {existingConfig ? (
              <Button 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Configuration
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configure WhatsApp API
              </Button>
            )}
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
      
      {existingConfig && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Current Configuration</h2>
          <div className="grid gap-4">
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={existingConfig.api_key}
                disabled
              />
            </div>
            <div>
              <Label>Template Namespace</Label>
              <Input
                value={existingConfig.template_namespace}
                disabled
              />
            </div>
            <div>
              <Label>Template Name</Label>
              <Input
                value={existingConfig.template_name}
                disabled
              />
            </div>
            <div>
              <Label>From Phone Number ID</Label>
              <Input
                value={existingConfig.from_phone_number_id}
                disabled
              />
            </div>
          </div>
        </div>
      )}
      
      <PaymentReminders />
    </div>
  );
}