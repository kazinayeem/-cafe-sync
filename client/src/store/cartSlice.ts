// store/orderSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface OrderState {
  items: OrderItem[];
  totalPrice: number;
}

const initialState: OrderState = {
  items: [],
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<OrderItem>) => {
      const { productId, size } = action.payload;

      // Check if product+size already exists in cart
      const existingIndex = state.items.findIndex(
        (item) => item.productId === productId && item.size === size
      );

      if (existingIndex >= 0) {
        // Increase quantity
        state.items[existingIndex].quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }

      // Recalculate total price
      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },

    removeItem: (
      state,
      action: PayloadAction<{ productId: string; size: string }>
    ) => {
      state.items = state.items.filter(
        (item) =>
          !(
            item.productId === action.payload.productId &&
            item.size === action.payload.size
          )
      );

      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },

    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
    },

    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        size: string;
        quantity: number;
      }>
    ) => {
      const { productId, size, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.productId === productId && i.size === size
      );
      if (item) {
        item.quantity = quantity;
      }

      state.totalPrice = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
    },
  },
});

export const { addItem, removeItem, clearCart, updateQuantity } =
  cartSlice.actions;
export default cartSlice.reducer;
