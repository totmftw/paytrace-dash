import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BasicInfoFields } from "./FormFields/BasicInfoFields";
import { ContactFields } from "./FormFields/ContactFields";
import { WorkInfoFields } from "./FormFields/WorkInfoFields";
import { formSchema, FormValues } from "./types";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddUserDialog = ({ open, onOpenChange }: AddUserDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "team_member",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('email', values.email);

      if (count && count > 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "A user with this email already exists",
        });
        return;
      }

      const { error } = await supabase.rpc("create_new_user_with_profile", {
        user_email: values.email,
        user_password: values.password,
        user_full_name: values.full_name,
        user_role: values.role,
        user_phone: values.phone_number,
        user_designation: values.designation,
        user_department: values.department,
        user_emergency_contact: values.emergency_contact,
        user_address: values.address,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error creating user",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BasicInfoFields form={form} />
            <WorkInfoFields form={form} />
            <ContactFields form={form} />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;