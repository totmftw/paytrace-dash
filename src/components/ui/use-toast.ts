// Re-export the hooks from the correct location
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast };
export function useToast() {
    return {
      toast: (message: string) =>
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        }),
      success: (message: string) =>
        toast({
          title: "Success",
          description: message,
        }),
    };
  }