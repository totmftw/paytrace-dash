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

export function CustomerTable() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customerMaster")
        .select("*");
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      return data;
    },
  });

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
  };

  if (error) {
    return <div>Error loading customers: {(error as Error).message}</div>;
  }

  if (isLoading) {
    return <div>Loading customers...</div>;
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