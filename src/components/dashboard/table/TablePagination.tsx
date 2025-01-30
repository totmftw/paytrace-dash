import { Button } from "@/components/ui/button";
import { Table } from "@tanstack/react-table";
import { Payment } from "../PaymentDetailsTable";

interface TablePaginationProps {
  table: Table<Payment>;
}

export function TablePagination({ table }: TablePaginationProps) {
  return (
    <div className="flex items-center justify-end space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  );
}