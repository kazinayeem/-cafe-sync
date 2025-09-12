import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import { staffApi } from "@/services/staffService";
export const store = configureStore({
  reducer: {
    user: userReducer,
    [staffApi.reducerPath]: staffApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(staffApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
