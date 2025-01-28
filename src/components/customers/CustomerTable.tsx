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

type Customer = {
  id: number;
  custBusinessname: string;
  custOwnername: string;
  custPhone: number;
  custWhatsapp: number;
  custOwnerphone: number;
  custOwnerwhatsapp: number;
  custEmail: string;
  custOwneremail: string;
  custType: string;
  custAddress: string;
  custProvince: string;
  custCity: string;
  custPincode: number;
  custGST: string;
  custRemarks: string;
  custStatus: string;
  custCreditperiod: number;
};

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
    accessorKey: "custOwnerphone",
    header: "Owner Phone",
  },
  {
    accessorKey: "custOwnerwhatsapp",
    header: "Owner WhatsApp",
  },
  {
    accessorKey: "custEmail",
    header: "Email",
  },
  {
    accessorKey: "custOwneremail",
    header: "Owner Email",
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
    accessorKey: "custProvince",
    header: "Province",
  },
  {
    accessorKey: "custCity",
    header: "City",
  },
  {
    accessorKey: "custPincode",
    header: "Pincode",
  },
  {
    accessorKey: "custGST",
    header: "GST",
  },
  {
    accessorKey: "custRemarks",
    header: "Remarks",
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
    <Paper>
      {/* Search Bar at the top */}
      <SearchBar onSearch={handleSearch} />

      {/* Table Content */}
      <TableContainer>
        <Table>
          <TableHeader />
          <TableBodyContent
            customers={filteredCustomers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Table>
      </TableContainer>

      {/* Pagination */}
      <div style={{ padding: "16px" }}>
        <Button onClick={() => handleChangePage(page - 1)} disabled={page === 0}>
          Previous
        </Button>
        <Button
          onClick={() => handleChangePage(page + 1)}
          disabled={page >= Math.ceil(customers.length / rowsPerPage) - 1}
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