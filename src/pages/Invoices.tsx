import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Invoices = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to view invoices",
        });
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
  
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        throw new Error("No authenticated session");
      }

      const { data, error } = await supabase
        .from("invoiceTable")
        .select(`
          *,
          customerMaster (
            custBusinessname,
            custOwnername
          )
        `);
      
      if (error) {
        console.error("Supabase error:", error);
        toast({
          variant: "destructive",
          title: "Error fetching invoices",
          description: error.message,
        });
        throw error;
      }
      return data;
    },
  });

  if (error) {
    console.error("Query error:", error);
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-red-500">
                  Error loading invoices. Please try again.
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
                    {invoice.invMarkcleared ? "Paid" : "Pending"}
                  </TableCell>
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