import { CustomerExcelUpload } from "@/components/customers/CustomerExcelUpload";
import { CustomerFilters, type CustomerFilters as FilterType } from "@/components/customers/CustomerFilters";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { useState } from "react";

const Customers = () => {
  const [activeFilters, setActiveFilters] = useState<FilterType>({
    location: "",
    type: "",
    status: "",
  });

  const handleFilterChange = (filters: FilterType) => {
    setActiveFilters(filters);
    // The CustomerTable component will handle the filtering internally
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <CustomerExcelUpload />
      </div>
      <CustomerFilters onFilterChange={handleFilterChange} />
      <CustomerTable />
    </div>
  );
};

export default Customers;