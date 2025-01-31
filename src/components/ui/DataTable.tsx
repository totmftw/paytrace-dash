import {
  Table,
  TableBody,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useReactTable, ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';

interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  onColumnVisibilityChange?: (columns: string[]) => void;
}

export function DataTable<T extends object>({
  data,
  columns,
  isLoading,
  onColumnVisibilityChange,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: (rows, id, filterValue) => {
        const text = (row.getValue(id) as string).toLowerCase();
        return text.includes(filterValue.toLowerCase());
      },
    },
    state: {
      columnVisibility: columns.reduce((acc, col) => ({ ...acc, [col.id]: col.meta?.visible ?? true }), {} as Record<string, boolean>),
    },
    onColumnVisibilityChange: (updater) =>
      onColumnVisibilityChange?.(Object.entries(updater()).filter(([_, visible]) => visible).map(([key]) => key)),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-end mb-4">
        <SearchBar onSearch={(value) => table.setGlobalFilter(value)} />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : header.column.getCanSort()
                    ? <>{header.render('Header')} {header.column.getIsSorted() ? ((header.column.getIsSorted() === 'asc' ? '👆' : '👇') as any) : ''}</>
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          {/* Pagination controls */}
        </TableFooter>
      </Table>
    </div>
  );
}