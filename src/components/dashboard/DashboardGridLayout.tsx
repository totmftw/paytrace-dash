import React, { useState } from "react";
import GridLayout from "react-grid-layout";
import { Button } from "@/components/ui/button";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface DashboardWidget {
  id: string;
  component: ReactElement;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardGridLayoutProps {
  widgets: DashboardWidget[];
  layout: LayoutItem[];
  onLayoutChange: (newLayout: LayoutItem[]) => void;
  isEditMode: boolean;
}

export function DashboardGridLayout({
  widgets,
  layout,
  onLayoutChange,
  isEditMode,
}: DashboardGridLayoutProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="dashboard-container">
      <div className="toolbar">
        {isEditMode && (
          <Button
            variant={isEditing ? "destructive" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Layout"}
          </Button>
        )}
        {isEditing && (
          <Button onClick={() => onLayoutChange(layout)} className="apply-btn">
            Apply Changes
          </Button>
        )}
      </div>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={window.innerWidth - 200}
        margin={[10, 10]}
        isDraggable={isEditing}
        isResizable={isEditing}
        draggableHandle=".drag-handle"
        onLayoutChange={onLayoutChange}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="widget-container">
            {isEditing ? (
              <div className="drag-handle" />
            ) : (
              <div className="widget-header">
                <h3>{widget.id.replace(/-/g, " ")}</h3>
              </div>
            )}
            {widget.component}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}