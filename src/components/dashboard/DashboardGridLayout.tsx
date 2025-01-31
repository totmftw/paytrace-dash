import React, { useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Button } from "@/components/ui/button";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: React.ReactNode;
}

interface DashboardGridLayoutProps {
  widgets: DashboardWidget[];
  onApply?: (layout: any) => void;
}

export function DashboardGridLayout({ widgets, onApply }: DashboardGridLayoutProps) {
  const [isEditing, setIsEditing] = useState(false);
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
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: currentLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        margin={[10, 10]}
        compactType="vertical"
        isDraggable={isEditing}
        isResizable={isEditing}
        draggableHandle=".drag-handle"
        onLayoutChange={(layout) => handleLayoutChange(layout)}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="bg-white p-4 rounded-lg border shadow-sm">
            {isEditing && (
              <div className="drag-handle h-2 w-12 mx-auto mb-2 bg-gray-200 rounded cursor-move" />
            )}
            {widget.content}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}