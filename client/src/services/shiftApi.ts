import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface CashDrawerLog {
  _id: string;
  type: "cash_in" | "cash_out" | "cash_drop";
  amount: number;
  reason: string;
  createdAt: string;
}

export interface Shift {
  _id: string;
  cashier: { _id: string; name: string; email: string; role: string; position?: string };
  openingFloat: number;
  openingTime: string;
  closingTime?: string;
  status: "open" | "closed";
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  mobileSales: number;
  totalOrders: number;
  totalDiscounts: number;
  totalRefunds: number;
  closingNotes?: string;
  cashDrawerLogs?: CashDrawerLog[];
  createdAt: string;
  updatedAt: string;
}

export const shiftApi = createApi({
  reducerPath: "shiftApi",
  baseQuery: createCustomBaseQuery("/api/shifts"),
  tagTypes: ["CurrentShift", "ShiftHistory"],
  endpoints: (builder) => ({
    getCurrentShift: builder.query<{ success: boolean; data: Shift | null }, void>({
      query: () => "/current",
      providesTags: ["CurrentShift"],
    }),

    openShift: builder.mutation<{ success: boolean; data: Shift }, { openingFloat: number }>({
      query: (body) => ({
        url: "/open",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentShift", "ShiftHistory"],
    }),

    logCashMovement: builder.mutation<
      { success: boolean; data: { shift: Shift; log: CashDrawerLog } },
      { shiftId?: string; type: "cash_in" | "cash_out" | "cash_drop"; amount: number; reason: string }
    >({
      query: (body) => ({
        url: "/cash-movement",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentShift", "ShiftHistory"],
    }),

    closeShift: builder.mutation<
      { success: boolean; data: Shift; message: string },
      { shiftId: string; actualCash: number; closingNotes?: string }
    >({
      query: (body) => ({
        url: "/close",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CurrentShift", "ShiftHistory"],
    }),

    getShiftHistory: builder.query<
      { success: boolean; data: Shift[] },
      { limit?: number; cashierId?: string } | void
    >({
      query: (params) => {
        let url = "/history";
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.cashierId) queryParams.set("cashierId", params.cashierId);
        const qs = queryParams.toString();
        return qs ? `${url}?${qs}` : url;
      },
      providesTags: ["ShiftHistory"],
    }),
  }),
});

export const {
  useGetCurrentShiftQuery,
  useOpenShiftMutation,
  useLogCashMovementMutation,
  useCloseShiftMutation,
  useGetShiftHistoryQuery,
} = shiftApi;
