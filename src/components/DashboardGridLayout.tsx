import React, { useState } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import { Button } from '@/components/ui/button';
import { DashboardWidget } from '@/types/dashboard';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface DashboardGridLayoutProps {
  widgets: DashboardWidget[];
  onLayoutChange: (layout: Layout[]) => void;
  isEditMode: boolean;
}

export function DashboardGridLayout({ widgets, onLayoutChange, isEditMode }: DashboardGridLayoutProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<Layout[]>(
    widgets.map((widget) => ({
      i: widget.id,
      x: widget.x,
      y: widget.y,
      w: widget.w,
      h: widget.h,
    }))
  );

  const handleLayoutChange = (layout: Layout[]) => {
    setCurrentLayout(layout);
  };

  const handleApply = () => {
    onLayoutChange(currentLayout);
    setIsEditing(false);
  };

  return (
    <div>
      {isEditMode && (
        <div className="mb-4 flex justify-end gap-2">
          <Button
            variant={isEditing ? 'destructive' : 'outline'}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Configure Layout'}
          </Button>
          {isEditing && (
            <Button onClick={handleApply}>
              Apply Changes
            </Button>
          )}
        </div>
      )}
      <GridLayout
        className="layout"
        layout={currentLayout}
        cols={12}
        rowHeight={30}
        width={1200}
        margin={[10, 10]}
        compactType="vertical"
        isDraggable={isEditing}
        isResizable={isEditing}
        draggableHandle=".drag-handle"
        onLayoutChange={handleLayoutChange}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="bg-white p-4 rounded-lg border shadow-sm">
            {isEditing && (
              <div className="drag-handle h-2 w-12 mx-auto mb-2 bg-gray-200 rounded cursor-move" />
            )}
            {widget.content}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}