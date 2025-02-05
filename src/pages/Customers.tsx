
import { CustomerTable } from "@/components/customers/CustomerTable";
import { useInvoiceData } from "@/hooks/useInvoiceData";

export default function Customers() {
  const { data: invoices, isLoading, error } = useInvoiceData();

  if (error) return <div>Error loading customer data</div>;

  return (
    <div className="container mx-auto py-10">
      <CustomerTable data={invoices || []} isLoading={isLoading} />
    </div>
  );
}
