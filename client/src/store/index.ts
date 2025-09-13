import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import { staffApi } from "@/services/staffService";
import { categoryApi } from "@/services/categoryApi";
import { productApi } from "@/services/productApi";
import cartReducer from "./cartSlice";
import { orderApi } from "@/services/orderApi";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(staffApi.middleware)
      .concat(categoryApi.middleware)
      .concat(orderApi.middleware)
      .concat(productApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
