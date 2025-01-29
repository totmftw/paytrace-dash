import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import { PaymentLedgerDialog } from "@/components/payments/PaymentLedgerDialog";
import { ExcelUpload } from "@/components/dashboard/ExcelUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const Payments = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Payments</h2>
      {/* Add payments content here */}
    </div>
  );
};

export default Payments;
export default function Payments() {
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: number;
    name: string;
    whatsapp: number;
  } | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageSize, setPageSize] = useState(10);

  const { data: ledgerBalances, isLoading: isLoadingBalances } = useQuery({
    queryKey: ["ledger-balances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_ledger_balance')
        .select('*')
        .order('custBusinessname');

      if (error) throw error;
      return data;
    },
  });

  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
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
        .order('paymentDate', { ascending: false });

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
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedCustomer({
            id: row.original.custId,
            name: row.original.custBusinessname,
            whatsapp: row.original.custWhatsapp
          })}
          className="text-black"
        >
          View Ledger
        </Button>
      ),
    },
  ];

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

  const balanceTable = useReactTable({
    data: ledgerBalances || [],
    columns: balanceColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  const paymentTable = useReactTable({
    data: payments || [],
    columns: paymentColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  if (isLoadingBalances || isLoadingPayments) {
    return <div className="p-8 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <Tabs defaultValue="payments" className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight text-black">Payments</h2>
          <TabsList>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="upload">Upload Payments</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="payments" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-black">Customer Balances</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Filter business names..."
                    value={(balanceTable.getColumn("custBusinessname")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      balanceTable.getColumn("custBusinessname")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm bg-black text-white"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-auto">
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {balanceTable
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) =>
                                column.toggleVisibility(!!value)
                              }
                            >
                              {column.id}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full">
                  <Table>
                    <TableHeader>
                      {balanceTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {balanceTable.getRowModel().rows?.length ? (
                        balanceTable.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="text-black">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={balanceColumns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-black">Payment History</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Filter business names..."
                    value={(paymentTable.getColumn("invoiceTable.customerMaster.custBusinessname")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      paymentTable.getColumn("invoiceTable.customerMaster.custBusinessname")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm bg-black text-white"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="ml-auto">
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {paymentTable
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) =>
                                column.toggleVisibility(!!value)
                              }
                            >
                              {column.id}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] w-full">
                  <Table>
                    <TableHeader>
                      {paymentTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {paymentTable.getRowModel().rows?.length ? (
                        paymentTable.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id} className="text-black">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={paymentColumns.length}
                            className="h-24 text-center"
                          >
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Upload Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <ExcelUpload />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedCustomer && (
        <PaymentLedgerDialog
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          whatsappNumber={selectedCustomer.whatsapp}
        />
      )}
    </div>
  );
}