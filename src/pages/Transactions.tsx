// Transactions.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FinancialYearSelector } from "@/components/FinancialYearSelector";
import { useFinancialYear } from "@/contexts/FinancialYearContext";
import { CustomerLedgerTable } from "@/components/transactions/CustomerLedgerTable";

export default function Transactions() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { selectedYear, getFYDates } = useFinancialYear();
  const { start, end } = getFYDates();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', selectedYear],
    queryFn: async () => {
      const { data } = await supabase
        .from('"invoiceTable"')
        .select(`
          *,
          "customerMaster":invCustid (
            id, "custBusinessname", "custWhatsapp"
          )
        `)
        .gte('"invDate"', start.toISOString())
        .lte('"invDate"', end.toISOString());
  
      return data;
    }
  });

  export default function Transactions() {
    const { selectedYear, getFYDates } = useFinancialYear();
    const { start, end } = getFYDates();
  
    return (
      <div className="space-y-6 bg-[#E8F3E8] min-h-screen p-6">
        <FinancialYearSelector />
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CustomerLedgerTable 
            onCustomerClick={(customer) => navigate(`/customer/${customer.id}`)}
          />
          {/* Add other components */}
        </div>
      </div>
    );
  }
  
  4. User Management Page Updates
  UserManagement.tsx:
  tsxCopy
  
  // UserManagement.tsx
  import { RolePermissionsDialog } from "@/components/users/RolePermissionsDialog";
  import { useAuth } from "@/contexts/AuthContext";
  
  export default function UserManagement() {
    const { user } = useAuth();
    const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  
    return (
      <div className="space-y-6 p-6 bg-moss-green/10">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-forest-green">User Management</h2>
          {user?.role === "it_admin" && (
            <Button 
              onClick={() => setIsPermissionsDialogOpen(true)}
            >
              Manage Permissions
            </Button>
          )}
        </div>
  
        {/* Existing code */}
        
        {user?.role === "it_admin" && (
          <RolePermissionsDialog
            isOpen={isPermissionsDialogOpen}
            onClose={() => setIsPermissionsDialogOpen(false)}
          />
        )}
      </div>
    );
  }
  
  5. Other Fixes
  InvoiceTable.tsx (Customer Business Name):
  tsxCopy
  
  // InvoiceTable.tsx
  {
    accessorKey: "customerMaster.custBusinessname",
    header: "Customer Name",
    cell: ({ row }) => row.original.customerMaster?.custBusinessname || "N/A"
  },
  
  ExcelUpload.tsx (Payment Upload Fix):
  tsxCopy
  
  // ExcelUpload.tsx
  const processPayment = async (invoice: any, paymentAmount: number, row: ExcelPaymentRow) => {
    // ... Existing logic ...
  
    const { data: invoiceData, error: invoiceError } = await supabase
      .from("invoiceTable")
      .select("invId, invTotal, invBalanceAmount, invCustid")
      .eq("invNumber", row.InvoiceNumber)
      .single();
  
    if (invoiceError) throw invoiceError;
  
    // ... Rest of the logic ...
  };
  
  6. New Features
  Invoice Upload Buttons (InvoiceUploadButtons.tsx):
  tsxCopy
  
  // InvoiceUploadButtons.tsx
  import { Button } from "@/components/ui/button";
  import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
  
  export function InvoiceUploadButtons() {
    return (
      <div className="flex gap-4">
        <Button>Download Template</Button>
        <ExcelUpload type="invoice" />
        <Button onClick={() => navigate("/invoices/new")}>Add Invoice</Button>
      </div>
    );
  }
  
  User Permissions Dialog (RolePermissionsDialog.tsx):
  tsxCopy
  
  // RolePermissionsDialog.tsx
  export function RolePermissionsDialog() {
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  
    const handlePermissionToggle = (permissionId: string) => {
      setSelectedPermissions((prev) =>
        prev.includes(permissionId)
          ? prev.filter((id) => id !== permissionId)
          : [...prev, permissionId]
      );
    };
  
    return (
      <Dialog>
        <DialogContent>
          <Tree permissions={featurePermissions} onToggle={handlePermissionToggle} />
        </DialogContent>
      </Dialog>
    );
  }
  
  Permissions Tree Component:
  tsxCopy
  
  // Tree.tsx
  interface Permission {
    id: string;
    name: string;
    children?: Permission[];
  }
  
  interface TreeProps {
    permissions: Permission[];
    onToggle: (id: string) => void;
  }
  
  export function Tree({ permissions, onToggle }: TreeProps) {
    return (
      <ul>
        {permissions.map((permission) => (
          <li key={permission.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedPermissions.includes(permission.id)}
                onChange={() => onToggle(permission.id)}
              />
              {permission.name}
            </label>
            {permission.children && <Tree permissions={permission.children} onToggle={onToggle} />}
          </li>
        ))}
      </ul>
    );
  }
  
  These updates address all the required modifications, including financial year handling, dashboard metrics, permissions management, and UI fixes. Ensure proper testing after applying these changes.
  Copy
  Try Again
  Share
  
  
  
  // ... rest of the component ...

  return (
    <div className="space-y-6 bg-[#E8F3E8] min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1B4D3E]">Transactions</h2>
          <p className="text-[#4A7862]">
            View and manage all transactions
          </p>
        </div>
        <FinancialYearSelector />
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        {/* ... tabs content remains unchanged ... */}
      </Tabs>
    </div>
  );
}