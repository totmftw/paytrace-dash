import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import { useReactTable, ColumnDef, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface CustomerBalancesTableProps {
  financialYear: number;
}

const CustomerBalancesTable = ({ financialYear }: CustomerBalancesTableProps) => {
  const getFinancialYearStart = (year: number) => new Date(`${year}-04-01`).toISOString();
  const getFinancialYearEnd = (year: number) => new Date(`${year + 1}-03-31`).toISOString();

  const { data: ledgerBalances, isLoading } = useQuery({
    queryKey: ["ledger-balances", financialYear],
    queryFn: async () => {
      const startDate = getFinancialYearStart(financialYear);
      const endDate = getFinancialYearEnd(financialYear);

      const { data, error } = await supabase
        .from('customer_ledger_balance')
        .select('*')
        .gte("last_transaction_date", startDate)
        .lte("last_transaction_date", endDate)
        .order('custBusinessname');

      if (error) throw error;
      return data;
    },
  });

  const balanceColumns: ColumnDef<any>[] = [
    {
      accessorKey: "custBusinessname",
      header: "Business Name",
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => formatCurrency(row.getValue("balance")),
    },
    {
      accessorKey: "last_transaction_date",
      header: "Last Transaction",
      cell: ({ row }) => row.getValue("last_transaction_date")
        ? new Date(row.getValue("last_transaction_date")).toLocaleDateString()
        : '-',
    },
  ];

  const balanceTable = useReactTable({
    data: ledgerBalances || [],
    columns: balanceColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div>
      <ScrollArea className="h-[300px] w-full">
        <Table>
          <TableHeader>
            {balanceTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.renderHeader()}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {balanceTable.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {cell.renderCell()}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => balanceTable.previousPage()}
          disabled={!balanceTable.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => balanceTable.nextPage()}
          disabled={!balanceTable.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default CustomerBalancesTable;