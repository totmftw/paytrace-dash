// src/components/Table/Pagination.tsx
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  
  const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    return (
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-outline"
        >
          Previous
        </button>
        
        <span>
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-outline"
        >
          Next
        </button>
      </div>
    );
  };
  
  // Update InvoiceTable to include pagination and export
  const InvoiceTable = ({ invoices, loading }: InvoiceTableProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
  
    const paginatedInvoices = useMemo(() => {
      const start = (currentPage - 1) * itemsPerPage;
      return filteredAndSortedInvoices.slice(start, start + itemsPerPage);
    }, [filteredAndSortedInvoices, currentPage]);
  
    const totalPages = Math.ceil(filteredAndSortedInvoices.length / itemsPerPage);
  
    const handleExport = () => {
      const csv = Papa.unparse(
        filteredAndSortedInvoices.map(invoice => ({
          'Invoice ID': invoice.invId,
          'Customer': invoice.customerMaster?.custName,
          'Date': invoice.invDate,
          'Amount': invoice.invAmount,
          // Add more fields as needed
        }))
      );
  
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoices.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    };
  
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleExport}
            className="btn btn-secondary"
          >
            Export
          </button>
        </div>
  
        {/* Table content */}
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  };

  