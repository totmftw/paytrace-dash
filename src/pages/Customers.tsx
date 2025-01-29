import { useState } from "react";
import { CustomerExcelUpload } from "@/components/customers/CustomerExcelUpload";
import { CustomerFilters, type CustomerFilters as FilterType } from "@/components/customers/CustomerFilters";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CustomerDialog } from "@/components/customers/CustomerDialog";

export default function Customers() {
  const [activeFilters, setActiveFilters] = useState<FilterType>({
    location: "",
    type: "",
    status: "",
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleFilterChange = (filters: FilterType) => {
    setActiveFilters(filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <div className="flex gap-4">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
          <CustomerExcelUpload />
        </div>
      </div>
      <CustomerFilters onFilterChange={handleFilterChange} />
      <CustomerTable />
      {showAddDialog && (
        <CustomerDialog
          onClose={() => setShowAddDialog(false)}
          onSave={() => {
            setShowAddDialog(false);
          }}
        />
      )}
    </div>
  );
}