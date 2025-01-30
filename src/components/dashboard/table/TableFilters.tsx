import { Input } from "@/components/ui/input";
import { Table } from "@tanstack/react-table";
import { Payment } from "../PaymentDetailsTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableFiltersProps {
  table: Table<Payment>;
}

export function TableFilters({ table }: TableFiltersProps) {
  return (
    <div className="flex items-center justify-between">
      <Input
        placeholder="Filter business names..."
        value={(table.getColumn("customerMaster.custBusinessname")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("customerMaster.custBusinessname")?.setFilterValue(event.target.value)
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
  );
}