import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { columns, type Invoice } from "@/components/invoices/InvoiceColumns";
import type { PostgrestError } from "@supabase/supabase-js";

export default function Invoices() {
  const { toast } = useToast();
  const navigate = useNavigate();

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
              custOwnername,
              custWhatsapp,
              custOwnerwhatsapp
            )
          `)
          .order('invDuedate', { ascending: true });
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Invoices fetched successfully:", data);
        return data as unknown as Invoice[];
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
      <div className="overflow-auto">
        <InvoiceTable
          columns={columns}
          data={invoices || []}
          onRefresh={() => refetch()}
        />
      </div>
    </div>
  );
}