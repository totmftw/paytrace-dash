// src/components/ColumnManagerModal/index.tsx
import { Dialog } from '@headlessui/react';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ColumnManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ColumnManagerModal = ({ isOpen, onClose }: ColumnManagerModalProps) => {
  const { columns, visibleColumns, updateColumnVisibility, updateColumnOrder } = 
    useColumnPreferences('invoices');

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(visibleColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    updateColumnOrder(items);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <Dialog.Title className="text-xl font-bold mb-4">
            Manage Columns
          </Dialog.Title>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {columns.map((column, index) => (
                    <Draggable
                      key={column.key}
                      draggableId={column.key}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center p-2 bg-gray-50 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns.some(c => c.key === column.key)}
                            onChange={(e) => updateColumnVisibility(column.key, e.target.checked)}
                            className="mr-2"
                          />
                          <span>{column.header}</span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="btn btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ColumnManagerModal;
