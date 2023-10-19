import { createSlice } from "@reduxjs/toolkit";

export enum PhoneCallType {
  INCOMING,
  OUTGOING,
}

export interface IPhoneCallUI {
  isOpen: boolean;
  type: PhoneCallType;
  isAudioCall: boolean;
  callerDetails?: {
    senderWalletAddress: string;
    senderUserId: string;
    offer: RTCSessionDescription;
    senderSocketId: string;
  };
  mediaStream?: MediaStream;
}

const InitialPhoneCallUIState: IPhoneCallUI = {
  isOpen: false,
  type: PhoneCallType.OUTGOING,
  isAudioCall: true,
};

const PhoneCallReducer = createSlice({
  name: "Phone call interface",
  initialState: InitialPhoneCallUIState,
  reducers: {
    togglePhoneCallUI: (state: IPhoneCallUI, action) => {
      state.isOpen = action.payload.isOpen;
    },

    changePhonecallUIType: (state: IPhoneCallUI, action) => {
      state.type = action.payload.type;
    },

    setCallerDetails: (state: IPhoneCallUI, action) => {
      if (!state.callerDetails) {
        state.callerDetails = {
          senderWalletAddress: action.payload.senderWalletAddress,
          senderUserId: action.payload.senderUserId,
          offer: action.payload.offer,
          senderSocketId: action.payload.senderSocketId,
        };
      }
    },

    setMediaStream: (state: IPhoneCallUI, action) => {
      state.mediaStream = action.payload.mediaStream;
    },

    setIsAudiocall: (state: IPhoneCallUI, action) => {
      state.isAudioCall = action.payload.audiocall;
    },
  },
});
export const {
  togglePhoneCallUI,
  changePhonecallUIType,
  setCallerDetails,
  setMediaStream,
  setIsAudiocall,
} = PhoneCallReducer.actions;

export default PhoneCallReducer.reducer;
