import React from "react";
import { ColumnConfigProvider, useColumnConfig } from "@/contexts/columnConfigContext";

type ColumnConfigProps = {
  columns: string[];
};

function ColumnConfigContent({ columns }: ColumnConfigProps) {
  const { visibleColumns, setVisibleColumns } = useColumnConfig();

  return (
    <div>
      {columns.map((column) => (
        <label key={column}>
          <input
            type="checkbox"
            checked={visibleColumns.includes(column)}
            onChange={(e) => {
              const updated = [...visibleColumns];
              if (e.target.checked) {
                updated.push(column);
              } else {
                updated.splice(updated.indexOf(column), 1);
              }
              setVisibleColumns(updated);
            }}
          />
          {column}
        </label>
      ))}
    </div>
  );
}

export default function ColumnConfig(props: ColumnConfigProps) {
  return (
    <ColumnConfigProvider>
      <ColumnConfigContent {...props} />
    </ColumnConfigProvider>
  );
}