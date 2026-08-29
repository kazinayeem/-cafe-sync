import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./apiConfig";

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  totalSpent: number;
  totalOrders: number;
  tags?: string[];
  notes?: string;
  lastVisit?: string;
  createdAt: string;
}

export interface LoyaltyTransaction {
  _id: string;
  customer: string;
  type: "earned" | "redeemed" | "adjusted";
  points: number;
  order?: any;
  reason?: string;
  staff?: { name: string };
  createdAt: string;
}

export interface CustomerResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Customer", "Loyalty"],
  endpoints: (builder) => ({
    getCustomers: builder.query<
      CustomerResponse,
      { page?: number; limit?: number; search?: string; phone?: string } | void
    >({
      query: (params) => ({
        url: "/api/customers",
        params: params || {},
      }),
      providesTags: ["Customer"],
    }),

    getCustomerById: builder.query<{ success: boolean; data: Customer }, string>({
      query: (id) => `/api/customers/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Customer", id }],
    }),

    createCustomer: builder.mutation<
      { success: boolean; data: Customer },
      Partial<Customer>
    >({
      query: (body) => ({
        url: "/api/customers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),

    updateCustomer: builder.mutation<
      { success: boolean; data: Customer },
      { id: string; data: Partial<Customer> }
    >({
      query: ({ id, data }) => ({
        url: `/api/customers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: "Customer", id }, "Customer"],
    }),

    adjustLoyaltyPoints: builder.mutation<
      { success: boolean; data: Customer },
      { id: string; points: number; reason: string }
    >({
      query: ({ id, points, reason }) => ({
        url: `/api/customers/${id}/loyalty`,
        method: "POST",
        body: { points, reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Customer", id },
        "Customer",
        "Loyalty",
      ],
    }),

    getLoyaltyLedger: builder.query<
      { success: boolean; data: LoyaltyTransaction[] },
      string
    >({
      query: (id) => `/api/customers/${id}/loyalty-ledger`,
      providesTags: ["Loyalty"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useAdjustLoyaltyPointsMutation,
  useGetLoyaltyLedgerQuery,
} = customerApi;
