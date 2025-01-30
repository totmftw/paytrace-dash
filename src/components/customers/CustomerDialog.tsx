import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomerDialogProps {
  onClose: () => void;
  onSave: () => void;
}

export function CustomerDialog({ onClose, onSave }: CustomerDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    custBusinessname: "",
    custOwnername: "",
    custPhone: "",
    custWhatsapp: "",
    custOwnerphone: "",
    custOwnerwhatsapp: "",
    custEmail: "",
    custOwneremail: "",
    custType: "",
    custAddress: "",
    custProvince: "",
    custCity: "",
    custPincode: "",
    custGST: "",
    custRemarks: "",
    custStatus: "active",
    custCreditperiod: "",
  });

  const validateEmail = async (email: string) => {
    const { data } = await supabase
      .from("customerMaster")
      .select("custEmail")
      .eq("custEmail", email)
      .single();
    
    return !data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First validate email
      const isEmailValid = await validateEmail(formData.custEmail);
      if (!isEmailValid) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "A customer with this email already exists.",
        });
        return;
      }

      const { error } = await supabase
        .from("customerMaster")
        .insert([{
          ...formData,
          custPhone: Number(formData.custPhone) || null,
          custWhatsapp: Number(formData.custWhatsapp) || null,
          custOwnerphone: Number(formData.custOwnerphone) || null,
          custOwnerwhatsapp: Number(formData.custOwnerwhatsapp) || null,
          custPincode: Number(formData.custPincode) || null,
          custCreditperiod: Number(formData.custCreditperiod) || null,
        }]);

      if (error) {
        if (error.code === "23505") {
          toast({
            variant: "destructive",
            title: "Error",
            description: "A customer with this email already exists.",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Customer added successfully",
      });
      onSave();
    } catch (error: any) {
      console.error("Error adding customer:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add customer. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custBusinessname">Business Name *</Label>
              <Input
                id="custBusinessname"
                value={formData.custBusinessname}
                onChange={(e) => setFormData(prev => ({ ...prev, custBusinessname: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custOwnername">Owner Name *</Label>
              <Input
                id="custOwnername"
                value={formData.custOwnername}
                onChange={(e) => setFormData(prev => ({ ...prev, custOwnername: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custPhone">Phone *</Label>
              <Input
                id="custPhone"
                type="number"
                value={formData.custPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, custPhone: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custWhatsapp">WhatsApp *</Label>
              <Input
                id="custWhatsapp"
                type="number"
                value={formData.custWhatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, custWhatsapp: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custEmail">Email *</Label>
              <Input
                id="custEmail"
                type="email"
                value={formData.custEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, custEmail: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custGST">GST *</Label>
              <Input
                id="custGST"
                value={formData.custGST}
                onChange={(e) => setFormData(prev => ({ ...prev, custGST: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custType">Type *</Label>
              <Input
                id="custType"
                value={formData.custType}
                onChange={(e) => setFormData(prev => ({ ...prev, custType: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custCreditperiod">Credit Period (days)</Label>
              <Input
                id="custCreditperiod"
                type="number"
                value={formData.custCreditperiod}
                onChange={(e) => setFormData(prev => ({ ...prev, custCreditperiod: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}