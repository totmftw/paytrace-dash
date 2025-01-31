import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import { Button } from "@/components/ui/button";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface DashboardWidget {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: JSX.Element;
}

interface DashboardGridLayoutProps {
  widgets: DashboardWidget[];
  onApply?: (layout: any) => void;
}

export function DashboardGridLayout({ widgets, onApply }: DashboardGridLayoutProps) {
  const [isEditing, setIsEditing] = useState(false);
  const initialized = React.useRef(false);
  const [currentLayout, setCurrentLayout] = useState<any[]>(widgets.map((widget) => ({
    i: widget.id,
    x: widget.x,
    y: widget.y,
    w: widget.w,
    h: widget.h,
  })));

  const handleLayoutChange = (layout: any) => {
    setCurrentLayout(layout);
  };

  const handleApply = () => {
    if (onApply) {
      onApply(currentLayout);
      setIsEditing(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          variant={isEditing ? "destructive" : "outline"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Configure Layout"}
        </Button>
        {isEditing && (
          <Button
            onClick={handleApply}
            className="ml-2"
          >
            Apply Changes
          </Button>
        )}
      </div>
      <GridLayout
        className="layout"
        layout={currentLayout}
        cols={12}
        rowHeight={30}
        width={window.innerWidth - 200}
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