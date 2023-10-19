import { createSlice } from "@reduxjs/toolkit";

export interface IInitialCurrectChat {
  remoteWalletAddress: string;
  userId: string;
  socketId: string;
}

const initialCurrectChat: IInitialCurrectChat = {
  remoteWalletAddress: "",
  userId: "",
  socketId: "",
};

const CurrentChat = createSlice({
  name: "Currect Active Chat",
  initialState: initialCurrectChat,
  reducers: {
    setCurrectActiveChat: (state: IInitialCurrectChat, action) => {
      state.remoteWalletAddress = action.payload.remoteWalletAddress;
      state.userId = action.payload.userId;
      if (action.payload.socketId) {
        state.socketId = action.payload.socketId;
      }
    },
  },
});

export const { setCurrectActiveChat } = CurrentChat.actions;

export default CurrentChat.reducer;
