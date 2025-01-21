import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerFilters } from "./CustomerFilters";
import { CustomerEditDialog } from "./CustomerEditDialog";
import { useToast } from "@/hooks/use-toast";

export function CustomerTable() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { toast } = useToast();

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("customerMaster")
          .select("*");
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Error fetching customers",
            description: error.message
          });
          throw error;
        }
        
        return data;
      } catch (err) {
        console.error("Fetch error:", err);
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Failed to connect to the server. Please check your internet connection and try again."
        });
        throw err;
      }
    },
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
  };

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">Error loading customers</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>Owner Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.custBusinessname}</TableCell>
                <TableCell>{customer.custOwnername}</TableCell>
                <TableCell>{customer.custPhone}</TableCell>
                <TableCell>{customer.custEmail}</TableCell>
                <TableCell>{customer.custType.join(", ")}</TableCell>
                <TableCell>{customer.custStatus.join(", ")}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEdit(customer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedCustomer && (
        <CustomerEditDialog
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onSave={() => {
            setSelectedCustomer(null);
            refetch();
          }}
        />
      )}
    </>
  );
}