// src/store/slices/widgetLayout.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WidgetLayoutState {
  layout: Object[];
  isDragging: boolean;
  resizing: boolean;
}

const initialState: WidgetLayoutState = {
  layout: [],
  isDragging: false,
  resizing: false,
};

export const widgetLayoutSlice = createSlice({
  name: 'widgetLayout',
  initialState,
  reducers: {
    updateWidgetLayout: (state, action: PayloadAction<any>) => {
      state.layout = action.payload;
    },
    startDragging: (state) => {
      state.isDragging = true;
    },
    stopDragging: (state) => {
      state.isDragging = false;
    },
  },
});