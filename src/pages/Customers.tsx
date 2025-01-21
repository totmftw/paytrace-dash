import { CustomerExcelUpload } from "@/components/customers/CustomerExcelUpload";
import { CustomerFilters } from "@/components/customers/CustomerFilters";
import { CustomerTable } from "@/components/customers/CustomerTable";

const Customers = () => {
  const handleFilterChange = (filters: any) => {
    console.log("Filters changed:", filters);
    // TODO: Implement filter logic
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