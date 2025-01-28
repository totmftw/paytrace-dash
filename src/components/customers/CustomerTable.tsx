import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerEditDialog } from "./CustomerEditDialog";
import { useToast } from "@/hooks/use-toast";
import { PostgrestError } from "@supabase/supabase-js";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Customer } from '@/types/customer';

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "custBusinessname",
    header: "Business Name",
  },
  {
    accessorKey: "custOwnername",
    header: "Owner Name",
  },
  {
    accessorKey: "custPhone",
    header: "Phone",
  },
  {
    accessorKey: "custWhatsapp",
    header: "WhatsApp",
  },
  {
    accessorKey: "custEmail",
    header: "Email",
  },
  {
    accessorKey: "custType",
    header: "Type",
  },
  {
    accessorKey: "custAddress",
    header: "Address",
  },
  {
    accessorKey: "custGST",
    header: "GST",
  },
  {
    accessorKey: "custStatus",
    header: "Status",
  },
  {
    accessorKey: "custCreditperiod",
    header: "Credit Period",
  },
];

export function CustomerTable() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();

  const { data: customers, isLoading, error, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      try {
        console.log("Fetching customers...");
        const { data, error } = await supabase
          .from("customerMaster")
          .select("*")
          .throwOnError();
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        console.log("Customers fetched successfully:", data);
        return data;
      } catch (err) {
        console.error("Fetch error:", err);
        const error = err as Error | PostgrestError;
        toast({
          variant: "destructive",
          title: "Error fetching customers",
          description: error.message || "Failed to connect to the server. Please check your internet connection and try again."
        });
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  });

  const table = useReactTable({
    data: customers || [],
    columns,
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

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">Unable to load customers</p>
        <Button 
          onClick={() => refetch()}
          className="bg-primary hover:bg-primary/90"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Filter business names..."
          value={(table.getColumn("custBusinessname")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("custBusinessname")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {table.getHeaderGroups().map((headerGroup) => (
                headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedCustomer(row.original)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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

      {selectedCustomer && (
        <CustomerEditDialog
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onSave={() => {
            setSelectedCustomer(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
