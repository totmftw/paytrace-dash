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
  const [isOpen, setIsOpen] = useState(false);
  const [customPageSize, setCustomPageSize] = useState<string>(pageSize.toString());
  const [tempColumnVisibility, setTempColumnVisibility] = useState(table.getState().columnVisibility);
  const [tempColumnOrder, setTempColumnOrder] = useState(table.getState().columnOrder);

  const handlePageSizeChange = (value: string) => {
    const size = parseInt(value);
    if (!isNaN(size) && size > 0 && size <= 500) {
      setCustomPageSize(value);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tempColumnOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTempColumnOrder(items);
  };

  const handleReset = () => {
    const defaultVisibility = {};
    const defaultOrder = table.getAllLeafColumns().map(column => column.id);
    setTempColumnVisibility(defaultVisibility);
    setTempColumnOrder(defaultOrder);
    setCustomPageSize("10");
  };

  const handleApply = () => {
    table.setColumnVisibility(tempColumnVisibility);
    table.setColumnOrder(tempColumnOrder);
    onPageSizeChange(parseInt(customPageSize));
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                  variant={parseInt(customPageSize) === size ? "default" : "outline"}
                  onClick={() => setCustomPageSize(size.toString())}
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
                      {tempColumnOrder.map((columnId, index) => {
                        const column = table.getColumn(columnId);
                        if (!column || !column.getCanHide()) return null;
                        return (
                          <Draggable
                            key={columnId}
                            draggableId={columnId}
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
                                  checked={!tempColumnVisibility[columnId]}
                                  onCheckedChange={(value) => {
                                    setTempColumnVisibility({
                                      ...tempColumnVisibility,
                                      [columnId]: !value,
                                    });
                                  }}
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
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}