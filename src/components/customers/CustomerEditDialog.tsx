import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function CustomerEditDialog({ 
  customer, 
  onClose, 
  onSave 
}: { 
  customer: any; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [formData, setFormData] = useState(customer);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("customerMaster")
        .update({
          custBusinessname: formData.custBusinessname,
          custOwnername: formData.custOwnername,
          custPhone: formData.custPhone,
          custEmail: formData.custEmail,
          custType: formData.custType,
          custStatus: formData.custStatus,
        })
        .eq("id", customer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      onSave();
    } catch (error) {
      console.error("Update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update customer",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="businessName" className="text-right">
                Business Name
              </Label>
              <Input
                id="businessName"
                name="custBusinessname"
                value={formData.custBusinessname}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownerName" className="text-right">
                Owner Name
              </Label>
              <Input
                id="ownerName"
                name="custOwnername"
                value={formData.custOwnername}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                name="custPhone"
                type="tel"
                value={formData.custPhone}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="custEmail"
                type="email"
                value={formData.custEmail}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}