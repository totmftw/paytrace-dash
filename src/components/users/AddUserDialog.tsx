import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateUserFormProps {
  onSuccess?: () => void;
}

// Define FormValues explicitly instead of using z.infer to avoid excessive type instantiation
interface FormValues {
  email: string;
  password: string;
  full_name: string;
  role: "business_owner" | "business_manager" | "order_manager" | "it_admin" | "team_member";
  phone_number: string;
  designation: string;
  department: string;
  emergency_contact: string;
  address: string;
}

const formSchema: z.ZodType<FormValues> = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(2),
  role: z.enum(["business_owner", "business_manager", "order_manager", "it_admin", "team_member"]),
  phone_number: z.string().min(10),
  designation: z.string().min(2),
  department: z.string().min(2),
  emergency_contact: z.string().min(10),
  address: z.string().min(5),
});

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "team_member",
      phone_number: "",
      designation: "",
      department: "",
      emergency_contact: "",
      address: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
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
      onSuccess?.();
    } catch (error: any) {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {Object.keys(formSchema.shape).map((fieldName) => (
          <FormField
            key={fieldName}
            control={form.control}
            name={fieldName as keyof FormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{fieldName.replace("_", " ").toUpperCase()}</FormLabel>
                <FormControl>
                  {fieldName === "role" ? (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="business_owner">Business Owner</SelectItem>
                        <SelectItem value="business_manager">Business Manager</SelectItem>
                        <SelectItem value="order_manager">Order Manager</SelectItem>
                        <SelectItem value="it_admin">IT Admin</SelectItem>
                        <SelectItem value="team_member">Team Member</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input {...field} type={fieldName === "password" ? "password" : "text"} />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create User"}
        </Button>
      </form>
    </Form>
  );
}
