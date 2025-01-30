import React from "react";
import { ColumnConfigProvider, useColumnConfig } from "@/contexts/columnConfigContext";
// src/components/ColumnConfig.tsx
import Sortable from 'sortablejs';

function ColumnConfigContent({ columns }: ColumnConfigProps) {
  const { visibleColumns, setVisibleColumns } = useColumnConfig();
  
  const handleSort = (e: SortEvent) => {
    const updated = e.oldIndex !== undefined && e.newIndex !== undefined
      ? [...visibleColumns]
      : [];
    if (e.oldIndex !== undefined && e.newIndex !== undefined) {
      const [removed] = updated.splice(e.oldIndex, 1);
      updated.splice(e.newIndex, 0, removed);
    }
    setVisibleColumns(updated);
  };

  React.useEffect(() => {
    const table = document.querySelector('.data-table') as HTMLElement;
    if (table) {
      const sortable = new Sortable(table.children[0] as HTMLElement, {
        animation: 150,
        onUpdate: handleSort
      });
      return () => sortable.destroy();
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Columns:</span>
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
                  const index = updated.indexOf(column);
                  if (index > -1) updated.splice(index, 1);
                }
                setVisibleColumns(updated);
              }}
            />
            {column}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => setVisibleColumns(columns)}>
          Reset Columns
        </Button>
      </div>
    </div>
  );
}
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