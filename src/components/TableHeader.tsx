import React from "react";
import { TableHead, TableRow, TableHeader as Header } from "@/components/ui/table";

interface Column {
  header: string;
}

interface TableHeaderProps {
  columns: Column[];
}

export function TableHeader({ columns }: TableHeaderProps) {
  return (
    <Header>
      <TableRow>
        {columns.map((column, index) => (
          <TableHead key={index}>{column.header}</TableHead>
        ))}
      </TableRow>
    </Header>
  );
}