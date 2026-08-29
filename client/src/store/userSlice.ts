import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string | null;
  email: string | null;
  role: string | null;
  token: string | null;
  permissions?: string[];
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
        name?: string;
        email?: string;
        role?: string;
        token: string;
        permissions?: string[];
      }>
    ) => {
      state.name = action.payload.name || null;
      state.email = action.payload.email || null;
      state.role = action.payload.role || null;
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
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
