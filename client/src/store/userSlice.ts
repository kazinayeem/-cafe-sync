import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UserState {
  name: string | null;
  email: string | null;
  role: "admin" | "manager" | "cashier" | "barista" | "staff" | "customer" | null;
  token: string | null;
  permissions: string[];
}

const initialState: UserState = {
  name: null,
  email: null,
  role: null,
  token: null,
  permissions: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        name: string;
        email: string;
        role: "admin" | "manager" | "cashier" | "barista" | "staff" | "customer";
        token: string;
        permissions?: string[];
      }>
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.token = action.payload.token;
      state.permissions = action.payload.permissions || [];
    },
    logout: (state) => {
      state.name = null;
      state.email = null;
      state.role = null;
      state.token = null;
      state.permissions = [];
    },
    updatePermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
  },
});

export const { login, logout, updatePermissions } = userSlice.actions;
export default userSlice.reducer;
