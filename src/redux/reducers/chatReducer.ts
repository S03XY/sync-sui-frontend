import { createSlice } from "@reduxjs/toolkit";

export interface IChatInterfaceParams {
  tab: number;
}

const initialChatParams: IChatInterfaceParams = {
  tab: 0,
};

const chartInterfaceSlice = createSlice({
  name: "chat slice",
  initialState: initialChatParams,
  reducers: {
    toggleChatInterfaceTab: (state: IChatInterfaceParams, action) => {
      state.tab = action.payload.tab;
    },
  },
});

export const { toggleChatInterfaceTab } = chartInterfaceSlice.actions;

export default chartInterfaceSlice.reducer;
