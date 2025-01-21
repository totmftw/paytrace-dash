import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { PostgrestError } from "@supabase/supabase-js";

const Invoices = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Check if user has permission to clear invoices
  const { data: permissions, isLoading: permissionsLoading, error: permissionsError } = useQuery({
    queryKey: ["permissions", "invoice_clearing"],
    queryFn: async () => {
      try {
        console.log("Fetching user permissions...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        if (!session?.user?.id) {
          console.error("No authenticated session");
          throw new Error("No authenticated session");
        }

        console.log("Calling get_user_permissions for user:", session.user.id);
        const { data, error } = await supabase.rpc('get_user_permissions', {
          user_id: session.user.id
        });

        if (error) {
          console.error("Permissions error:", error);
          throw error;
        }

        console.log("Permissions data received:", data);
        const invoicePermissions = data?.find(p => p.resource === 'invoice_clearing');
        console.log("Invoice clearing permissions:", invoicePermissions);
        return invoicePermissions;
      } catch (error) {
        console.error("Error in permissions query:", error);
        throw error;
      }
    },
    retry: false,
    onError: (error) => {
      console.error("Permissions query error:", error);
      toast({
        variant: "destructive",
        title: "Error checking permissions",
        description: "Please try refreshing the page"
      });
    }
  });

  const clearInvoiceMutation = useMutation({
    mutationFn: async (invId: number) => {
      const { error } = await supabase
        .from('invoiceTable')
        .update({ invMarkcleared: true })
        .eq('invId', invId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Invoice cleared",
        description: "The invoice has been marked as cleared successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear invoice. Please try again.",
      });
      console.error("Error clearing invoice:", error);
    },
  });
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "There was a problem checking your authentication status",
        });
        navigate("/login");
        return;
      }
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to view invoices",
        });
        navigate("/login");
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);
  
  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error("No authenticated session");
        }

        console.log("Fetching invoices...");
        const { data, error } = await supabase
          .from("invoiceTable")
          .select(`
            *,
            customerMaster (
              custBusinessname,
              custOwnername
            )
          `)
          .order('invDuedate', { ascending: true });
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Invoices fetched successfully:", data);
        return data;
      } catch (err) {
        console.error("Query error:", err);
        const error = err as Error | PostgrestError;
        toast({
          variant: "destructive",
          title: "Error fetching invoices",
          description: error.message || "Failed to connect to the server. Please check your internet connection and try again."
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });

  if (permissionsError) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">Unable to verify permissions</p>
        <Button 
          onClick={() => navigate(0)}
          className="bg-primary hover:bg-primary/90"
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <ExcelUpload />
        </div>
        <div className="text-center p-4">
          <p className="text-red-500 mb-4">Unable to load invoices</p>
          <Button 
            onClick={() => refetch()}
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        <ExcelUpload />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              {permissions?.can_edit && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={permissions?.can_edit ? 7 : 6} className="text-center">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : (
              invoices?.map((invoice) => (
                <TableRow key={invoice.invId}>
                  <TableCell>{invoice.invNumber.join("-")}</TableCell>
                  <TableCell>
                    {invoice.customerMaster?.custBusinessname}
                  </TableCell>
                  <TableCell>{invoice.invDate}</TableCell>
                  <TableCell>{invoice.invDuedate}</TableCell>
                  <TableCell>₹{invoice.invTotal}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.invMarkcleared 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {invoice.invMarkcleared ? "Paid" : "Pending"}
                    </span>
                  </TableCell>
                  {permissions?.can_edit && (
                    <TableCell>
                      {!invoice.invMarkcleared && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearInvoiceMutation.mutate(invoice.invId)}
                          className="hover:bg-green-100 hover:text-green-800"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Mark as cleared</span>
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Invoices;
