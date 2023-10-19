import { createSlice } from "@reduxjs/toolkit";
import { constant } from "lodash";

export interface ICurrentUser {
  walletAddress: string;
  userId: string;
}

const initialCurrentUserState: ICurrentUser = {
  walletAddress: "",
  userId: "",
};

const currentUser = createSlice({
  name: "Active user",
  initialState: initialCurrentUserState,
  reducers: {
    updateActiveUser: (state: ICurrentUser, action) => {
      state.walletAddress = action.payload.walletAddress;
      state.userId = action.payload.userId;
    },
  },
});

export const { updateActiveUser } = currentUser.actions;

export default currentUser.reducer;
