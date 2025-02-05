import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface ColumnConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  columns: { id: string; label: string }[];
  visibleColumns: string[];
  onColumnVisibilityChange: (columns: string[]) => void;
  onColumnOrderChange: (columns: string[]) => void;
}

export function ColumnConfigDialog({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  onColumnVisibilityChange,
  onColumnOrderChange,
}: ColumnConfigDialogProps) {
  const [tempColumns, setTempColumns] = React.useState(columns);
  const [tempVisibility, setTempVisibility] = React.useState(visibleColumns);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tempColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTempColumns(items);
  };

  const handleApply = () => {
    onColumnVisibilityChange(tempVisibility);
    onColumnOrderChange(tempColumns.map(col => col.id));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Columns</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {tempColumns.map((column, index) => (
                    <Draggable
                      key={column.id}
                      draggableId={column.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center space-x-2 rounded-md border p-2"
                        >
                          <Checkbox
                            checked={tempVisibility.includes(column.id)}
                            onCheckedChange={(checked) => {
                              setTempVisibility(
                                checked
                                  ? [...tempVisibility, column.id]
                                  : tempVisibility.filter((id) => id !== column.id)
                              );
                            }}
                          />
                          <span>{column.label}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </ScrollArea>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}