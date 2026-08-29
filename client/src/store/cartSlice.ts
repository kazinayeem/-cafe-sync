import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/services/productApi";
import type { Customer } from "@/services/customerApi";

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  itemKey: string;
  product: Product;
  size: "small" | "large" | "extraLarge";
  quantity: number;
  selectedModifiers: SelectedModifier[];
  itemNote?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface CartState {
  items: CartItem[];
  selectedTable: string | null;
  selectedCustomer: Customer | null;
  orderType: "dine_in" | "takeaway" | "delivery";
  discountPercent: number;
  loyaltyPointsToRedeem: number;
  orderNote: string;
}

const initialState: CartState = {
  items: [],
  selectedTable: null,
  selectedCustomer: null,
  orderType: "dine_in",
  discountPercent: 0,
  loyaltyPointsToRedeem: 0,
  orderNote: "",
};

export const generateCartItemKey = (
  productId: string,
  size: string,
  modifiers: SelectedModifier[] = [],
  itemNote: string = ""
): string => {
  const sortedModifiers = [...modifiers]
    .sort((a, b) => a.optionName.localeCompare(b.optionName))
    .map((m) => `${m.groupId}:${m.optionName}`)
    .join("|");
  return `${productId}_${size}_[${sortedModifiers}]_${itemNote.trim().toLowerCase()}`;
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        product: Product;
        size: "small" | "large" | "extraLarge";
        quantity?: number;
        selectedModifiers?: SelectedModifier[];
        itemNote?: string;
      }>
    ) => {
      const {
        product,
        size,
        quantity = 1,
        selectedModifiers = [],
        itemNote = "",
      } = action.payload;

      const basePrice = product.sizes?.[size] ?? 0;
      const modifiersTotal = selectedModifiers.reduce(
        (sum, mod) => sum + (mod.price || 0),
        0
      );
      const unitPrice = basePrice + modifiersTotal;

      const itemKey = generateCartItemKey(
        product._id,
        size,
        selectedModifiers,
        itemNote
      );

      const existingItem = state.items.find((item) => item.itemKey === itemKey);

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      } else {
        state.items.push({
          itemKey,
          product,
          size,
          quantity,
          selectedModifiers,
          itemNote,
          unitPrice,
          totalPrice: unitPrice * quantity,
        });
      }
    },

    updateItemQuantity: (
      state,
      action: PayloadAction<{ itemKey: string; quantity: number }>
    ) => {
      const { itemKey, quantity } = action.payload;
      const item = state.items.find((i) => i.itemKey === itemKey);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.itemKey !== itemKey);
        } else {
          item.quantity = quantity;
          item.totalPrice = item.quantity * item.unitPrice;
        }
      }
    },

    removeFromCart: (
      state,
      action: PayloadAction<{
        itemKey?: string;
        productId?: string;
        size?: string;
      }>
    ) => {
      if (action.payload.itemKey) {
        state.items = state.items.filter(
          (item) => item.itemKey !== action.payload.itemKey
        );
      } else if (action.payload.productId && action.payload.size) {
        state.items = state.items.filter(
          (item) =>
            !(
              item.product._id === action.payload.productId &&
              item.size === action.payload.size
            )
        );
      }
    },

    setSelectedTable: (state, action: PayloadAction<string | null>) => {
      state.selectedTable = action.payload;
    },

    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
      if (!action.payload) {
        state.loyaltyPointsToRedeem = 0;
      }
    },

    setOrderType: (
      state,
      action: PayloadAction<"dine_in" | "takeaway" | "delivery">
    ) => {
      state.orderType = action.payload;
      if (action.payload === "takeaway" || action.payload === "delivery") {
        state.selectedTable = null;
      }
    },

    setDiscountPercent: (state, action: PayloadAction<number>) => {
      state.discountPercent = Math.max(0, Math.min(100, action.payload));
    },

    setLoyaltyPointsToRedeem: (state, action: PayloadAction<number>) => {
      state.loyaltyPointsToRedeem = Math.max(0, action.payload);
    },

    setOrderNote: (state, action: PayloadAction<string>) => {
      state.orderNote = action.payload;
    },

    clearCart: (state) => {
      state.items = [];
      state.selectedTable = null;
      state.selectedCustomer = null;
      state.discountPercent = 0;
      state.loyaltyPointsToRedeem = 0;
      state.orderNote = "";
      state.orderType = "dine_in";
    },
  },
});

export const {
  addToCart,
  updateItemQuantity,
  removeFromCart,
  setSelectedTable,
  setSelectedCustomer,
  setOrderType,
  setDiscountPercent,
  setLoyaltyPointsToRedeem,
  setOrderNote,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
