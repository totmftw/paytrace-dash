import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Full name is required"),
  role: z.enum(["business_owner", "business_manager", "order_manager", "it_admin", "team_member"]),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  designation: z.string().min(2, "Designation is required"),
  department: z.string().min(2, "Department is required"),
  employee_id: z.string().min(2, "Employee ID is required"),
  emergency_contact: z.string().min(10, "Emergency contact must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
});

export function UserManagementForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "business_manager",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('create_new_user_with_profile', {
        user_email: data.email,
        user_password: data.password,
        user_full_name: data.full_name,
        user_role: data.role,
        user_phone: data.phone,
        user_designation: data.designation,
        user_department: data.department,
        user_emergency_contact: data.emergency_contact,
        user_address: data.address,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input {...form.register("email")} className="w-full" />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" {...form.register("password")} className="w-full" />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input {...form.register("full_name")} className="w-full" />
              {form.formState.errors.full_name && (
                <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                onValueChange={(value) => form.setValue("role", value as any)}
                defaultValue={form.getValues("role")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business_owner">Business Owner</SelectItem>
                  <SelectItem value="business_manager">Business Manager</SelectItem>
                  <SelectItem value="order_manager">Order Manager</SelectItem>
                  <SelectItem value="it_admin">IT Admin</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input {...form.register("phone")} className="w-full" />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Employee ID</label>
              <Input {...form.register("employee_id")} className="w-full" />
              {form.formState.errors.employee_id && (
                <p className="text-sm text-red-500">{form.formState.errors.employee_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Designation</label>
              <Input {...form.register("designation")} className="w-full" />
              {form.formState.errors.designation && (
                <p className="text-sm text-red-500">{form.formState.errors.designation.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input {...form.register("department")} className="w-full" />
              {form.formState.errors.department && (
                <p className="text-sm text-red-500">{form.formState.errors.department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Contact</label>
              <Input {...form.register("emergency_contact")} className="w-full" />
              {form.formState.errors.emergency_contact && (
                <p className="text-sm text-red-500">{form.formState.errors.emergency_contact.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input {...form.register("address")} className="w-full" />
            {form.formState.errors.address && (
              <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}