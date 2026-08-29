import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import cartReducer from "./cartSlice";
import { staffApi } from "@/services/staffService";
import { categoryApi } from "@/services/categoryApi";
import { productApi } from "@/services/productApi";
import { orderApi } from "@/services/orderApi";
import { userApi } from "@/services/userApi";
import { settingsApi } from "@/services/SettingsApi";
import { customerApi } from "@/services/customerApi";
import { modifierApi } from "@/services/modifierApi";
import { inventoryApi } from "@/services/inventoryApi";
import { shiftApi } from "@/services/shiftApi";
import { reservationApi } from "@/services/reservationApi";
import { activityLogApi } from "@/services/activityLogApi";
import { publicMenuApi } from "@/services/publicMenuApi";
import { tableApi } from "@/services/tableService";

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [modifierApi.reducerPath]: modifierApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [shiftApi.reducerPath]: shiftApi.reducer,
    [reservationApi.reducerPath]: reservationApi.reducer,
    [activityLogApi.reducerPath]: activityLogApi.reducer,
    [publicMenuApi.reducerPath]: publicMenuApi.reducer,
    [tableApi.reducerPath]: tableApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(staffApi.middleware)
      .concat(categoryApi.middleware)
      .concat(orderApi.middleware)
      .concat(userApi.middleware)
      .concat(settingsApi.middleware)
      .concat(productApi.middleware)
      .concat(customerApi.middleware)
      .concat(modifierApi.middleware)
      .concat(inventoryApi.middleware)
      .concat(shiftApi.middleware)
      .concat(reservationApi.middleware)
      .concat(activityLogApi.middleware)
      .concat(publicMenuApi.middleware)
      .concat(tableApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
