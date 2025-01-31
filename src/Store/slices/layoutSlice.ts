// src/store/layoutSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { saveLayoutToDatabase } from "@/apis/layoutApi";

interface LayoutState {
  layout: any[];
}

const initialState: LayoutState = {
  layout: [],
};

export const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    setLayout: (state, action: PayloadAction<any>) => {
      state.layout = action.payload;
    },
  },
});

export const { setLayout } = layoutSlice.actions;

export const saveLayout = (payload: any) => async (dispatch: any) => {
  await saveLayoutToDatabase(payload);
  dispatch(setLayout(payload));
};