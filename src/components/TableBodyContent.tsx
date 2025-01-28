import React from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

interface Customer {
  id: number;
  [key: string]: any;
}

interface TableBodyContentProps {
  customers: Customer[];
  columns: { accessorKey: string; header: string }[];
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

export function TableBodyContent({ 
  customers, 
  columns,
  onEdit,
  onDelete 
}: TableBodyContentProps) {
  return (
    <TableBody>
      {customers.length === 0 ? (
        <TableRow>
          <TableCell colSpan={columns.length} className="text-center">
            No customers found
          </TableCell>
        </TableRow>
      ) : (
        customers.map((customer) => (
          <TableRow key={customer.id}>
            {columns.map((column) => (
              <TableCell key={column.accessorKey}>
                {customer[column.accessorKey]}
              </TableCell>
            ))}
            <TableCell>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(customer)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(customer)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  );
}