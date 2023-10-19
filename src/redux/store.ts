import { combineReducers, configureStore } from "@reduxjs/toolkit";
import chartInterfaceReducer from "@/redux/reducers/chatReducer";
import currentActiveChat from "@/redux/reducers/currentChat";
import currentUser from "@/redux/reducers/currentUser";
import phoneCallInterface from "@/redux/reducers/phoneCallUI";

const rootReducer = combineReducers({
  chartInterfaceReducer,
  currentActiveChat,
  currentUser,
  phoneCallInterface,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
