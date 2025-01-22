import { useState } from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface ColumnSettingsProps<TData> {
  table: Table<TData>;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function ColumnSettings<TData>({ 
  table, 
  pageSize, 
  onPageSizeChange 
}: ColumnSettingsProps<TData>) {
  const [customPageSize, setCustomPageSize] = useState<string>(pageSize.toString());

  const handlePageSizeChange = (value: string) => {
    const size = parseInt(value);
    if (!isNaN(size) && size > 0 && size <= 500) {
      setCustomPageSize(value);
      onPageSizeChange(size);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(table.getAllLeafColumns());
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update column order
    table.setColumnOrder(items.map(column => column.id));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Column Settings</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Table Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Rows per page</Label>
            <div className="flex gap-2">
              {[10, 20, 50, 100].map((size) => (
                <Button
                  key={size}
                  variant={pageSize === size ? "default" : "outline"}
                  onClick={() => onPageSizeChange(size)}
                >
                  {size}
                </Button>
              ))}
              <Input
                type="number"
                min="1"
                max="500"
                value={customPageSize}
                onChange={(e) => handlePageSizeChange(e.target.value)}
                className="w-24"
                placeholder="Custom"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Column Visibility & Order</Label>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="columns">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {table.getAllLeafColumns().map((column, index) => {
                        if (!column.getCanHide()) return null;
                        return (
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
                                className="flex items-center space-x-2 rounded-md border p-2 hover:bg-muted"
                              >
                                <Checkbox
                                  checked={column.getIsVisible()}
                                  onCheckedChange={(value) =>
                                    column.toggleVisibility(!!value)
                                  }
                                />
                                <span className="text-sm">
                                  {column.id}
                                </span>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}