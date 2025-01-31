// src/components/Dashboard/DashboardGridLayout.tsx
import { Grid, GridItem } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateWidgetLayout } from '@/store/slices/widgetLayout';

const DashboardGridLayout: React.FC<{
  widgets: DashboardWidget[];
  onApply: (newLayout: any) => void;
}> = ({ widgets, onApply }) => {
  const { layout, drag, resize } = useAppSelector((state) => state.widgetLayout);
  const dispatch = useAppDispatch();

  const handleGridChange = (newLayout: any) => {
    dispatch(updateWidgetLayout(newLayout));
  };

  return (
    <Grid
      templateColumns={`repeat(${widgets.length}, minmax(250px, 1fr))`}
      gap={4}
      p={4}
    >
      {widgets.map((widget, index) => (
        <ReactGridLayout
          width={1200}
          cols={12}
          rowHeight={30}
          draggableCancel=".react-grid-item>.placeholder"
          key={index}
          layout={layout}
        >
          <Draggable
            onDrag={(x, y) => handleGridChange([{ ...widget, x, y }])}
            key={widget.id}
          >
            <ReactResizable
              width={widget.w * 100}
              height={widget.h * 30}
              onResize={(e, { size }) => handleGridChange([
                { ...widget, w: size.width / 100, h: size.height / 30 }
              ])}
            >
              <GridItem>
                {React.createElement(widget.content)}
              </GridItem>
            </ReactResizable>
          </Draggable>
        </ReactGridLayout>
      ))}
    </Grid>
  );
};