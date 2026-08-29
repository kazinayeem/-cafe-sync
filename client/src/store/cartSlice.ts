import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SelectedModifier {
  groupName: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  itemKey: string; // Unique hash: productId-size-[modifiers]
  productId: string;
  name: string;
  size: string;
  price: number; // Base unit price for this size
  modifiersPrice: number; // Total add-on price for modifiers per unit
  quantity: number;
  imageUrl?: string;
  selectedModifiers?: SelectedModifier[];
  itemNote?: string;
}

export interface CartCustomer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  totalPrice: number;
  discountPercent: number;
  loyaltyPointsToRedeem: number;
  customer: CartCustomer | null;
  selectedTable: string | null;
  orderType: "dine_in" | "takeaway" | "delivery";
  orderNote: string;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  totalPrice: 0,
  discountPercent: 0,
  loyaltyPointsToRedeem: 0,
  customer: null,
  selectedTable: null,
  orderType: "dine_in",
  orderNote: "",
};

const generateItemKey = (
  productId: string,
  size: string,
  modifiers: SelectedModifier[] = []
) => {
  const modStr = modifiers
    .map((m) => `${m.groupName}:${m.optionName}`)
    .sort()
    .join("|");
  return `${productId}-${size}-${modStr}`;
};

const calculateTotals = (state: CartState) => {
  state.subtotal = state.items.reduce(
    (sum, item) =>
      sum + (item.price + (item.modifiersPrice || 0)) * item.quantity,
    0
  );
  const discountAmount = (state.subtotal * (state.discountPercent || 0)) / 100;
  state.totalPrice = Math.max(0, state.subtotal - discountAmount);
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<{
        productId: string;
        name: string;
        size: string;
        price: number;
        imageUrl?: string;
        selectedModifiers?: SelectedModifier[];
        itemNote?: string;
        quantity?: number;
      }>
    ) => {
      const {
        productId,
        name,
        size,
        price,
        imageUrl,
        selectedModifiers = [],
        itemNote = "",
        quantity = 1,
      } = action.payload;

      const itemKey = generateItemKey(productId, size, selectedModifiers);
      const modifiersPrice = selectedModifiers.reduce(
        (sum, m) => sum + (Number(m.price) || 0),
        0
      );

      const existingIndex = state.items.findIndex(
        (item) => item.itemKey === itemKey
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += quantity;
        if (itemNote) {
          state.items[existingIndex].itemNote = itemNote;
        }
      } else {
        state.items.push({
          itemKey,
          productId,
          name,
          size,
          price,
          modifiersPrice,
          quantity,
          imageUrl,
          selectedModifiers,
          itemNote,
        });
      }

      calculateTotals(state);
    },

    removeItem: (state, action: PayloadAction<{ itemKey: string } | { productId: string; size: string }>) => {
      if ("itemKey" in action.payload) {
        state.items = state.items.filter(
          (item) => item.itemKey !== action.payload.itemKey
        );
      } else {
        state.items = state.items.filter(
          (item) =>
            !(
              item.productId === action.payload.productId &&
              item.size === action.payload.size
            )
        );
      }
      calculateTotals(state);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{
        itemKey?: string;
        productId?: string;
        size?: string;
        quantity: number;
      }>
    ) => {
      const { itemKey, productId, size, quantity } = action.payload;
      let item = null;

      if (itemKey) {
        item = state.items.find((i) => i.itemKey === itemKey);
      } else if (productId && size) {
        item = state.items.find(
          (i) => i.productId === productId && i.size === size
        );
      }

      if (item) {
        item.quantity = Math.max(1, quantity);
      }

      calculateTotals(state);
    },

    updateItemNote: (
      state,
      action: PayloadAction<{ itemKey: string; note: string }>
    ) => {
      const item = state.items.find((i) => i.itemKey === action.payload.itemKey);
      if (item) {
        item.itemNote = action.payload.note;
      }
    },

    setDiscountPercent: (state, action: PayloadAction<number>) => {
      state.discountPercent = Math.max(0, Math.min(100, action.payload));
      calculateTotals(state);
    },

    setLoyaltyPointsToRedeem: (state, action: PayloadAction<number>) => {
      state.loyaltyPointsToRedeem = Math.max(0, action.payload);
    },

    setCustomer: (state, action: PayloadAction<CartCustomer | null>) => {
      state.customer = action.payload;
      if (!action.payload) {
        state.loyaltyPointsToRedeem = 0;
      }
    },

    setSelectedTable: (state, action: PayloadAction<string | null>) => {
      state.selectedTable = action.payload;
      if (action.payload) {
        state.orderType = "dine_in";
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

    setOrderNote: (state, action: PayloadAction<string>) => {
      state.orderNote = action.payload;
    },

    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.totalPrice = 0;
      state.discountPercent = 0;
      state.loyaltyPointsToRedeem = 0;
      state.customer = null;
      state.selectedTable = null;
      state.orderType = "dine_in";
      state.orderNote = "";
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  updateItemNote,
  setDiscountPercent,
  setLoyaltyPointsToRedeem,
  setCustomer,
  setSelectedTable,
  setOrderType,
  setOrderNote,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
