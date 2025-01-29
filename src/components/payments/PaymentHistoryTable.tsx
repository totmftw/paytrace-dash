import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import { useReactTable, ColumnDef, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface PaymentHistoryTableProps {
  financialYear: number;
}

const PaymentHistoryTable = ({ financialYear }: PaymentHistoryTableProps) => {
  const getFinancialYearStart = (year: number) => new Date(`${year}-04-01`).toISOString();
  const getFinancialYearEnd = (year: number) => new Date(`${year + 1}-03-31`).toISOString();

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments", financialYear],
    queryFn: async () => {
      const startDate = getFinancialYearStart(financialYear);
      const endDate = getFinancialYearEnd(financialYear);

      const { data, error } = await supabase
        .from("paymentTransactions")
        .select(`
          *,
          invoiceTable (
            invNumber,
            invTotal,
            customerMaster (
              id,
              custBusinessname,
              custWhatsapp
            )
          )
        `)
        .gte("paymentDate", startDate)
        .lte("paymentDate", endDate)
        .order('paymentDate', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const paymentColumns: ColumnDef<any>[] = [
    {
      accessorKey: "paymentDate",
      header: "Date",
      cell: ({ row }) => new Date(row.getValue("paymentDate")).toLocaleDateString(),
    },
    {
      accessorKey: "invoiceTable.invNumber",
      header: "Invoice Number",
      cell: ({ row }) => row.original.invoiceTable?.invNumber?.join("-"),
    },
    {
      accessorKey: "invoiceTable.customerMaster.custBusinessname",
      header: "Business Name",
    },
    {
      accessorKey: "transactionId",
      header: "Transaction ID",
    },
    {
      accessorKey: "paymentMode",
      header: "Payment Mode",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => formatCurrency(row.getValue("amount")),
    },
  ];

  const paymentTable = useReactTable({
    data: payments || [],
    columns: paymentColumns,
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
            {paymentTable.getHeaderGroups().map((headerGroup) => (
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
            {paymentTable.getRowModel().rows.map((row) => (
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
          onClick={() => paymentTable.previousPage()}
          disabled={!paymentTable.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => paymentTable.nextPage()}
          disabled={!paymentTable.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PaymentHistoryTable;