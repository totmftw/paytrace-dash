// src/components/DashboardGridLayout.tsx
import React from "react";
import GridLayout from "react-grid-layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

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
  onApply?: () => void;
}

export function DashboardGridLayout({ widgets, onApply }: DashboardGridLayoutProps) {
  const { user } = useAuth();
  const isITAdmin = user?.role === "it_admin";

  return (
    <div>
      {isITAdmin && (
        <div className="mb-4">
          <Button variant="outline" onClick={onApply}>
            Apply Layout
          </Button>
        </div>
      )}
      <GridLayout
        className="layout"
        layout={widgets.map((widget) => ({
          ...widget,
          i: widget.id,
        }))}
        cols={12}
        rowHeight={30}
        margin={[10, 10]}
        compactType="vertical"
        isDraggable={isITAdmin}
        isResizable={isITAdmin}
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="bg-white p-4 rounded border">
            {widget.content}
          </div>
        ))}
      </GridLayout>
    </div>
  );
}