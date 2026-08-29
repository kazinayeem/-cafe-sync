import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerDetailResponse {
  customer: Customer;
  orders: any[];
  loyaltyHistory: any[];
}

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: createCustomBaseQuery("/api/customers"),
  tagTypes: ["Customers", "CustomerDetail"],
  endpoints: (builder) => ({
    getCustomers: builder.query<
      {
        success: boolean;
        data: Customer[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      },
      { search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        let url = "/";
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.set("search", params.search);
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        const qs = queryParams.toString();
        return qs ? `${url}?${qs}` : url;
      },
      providesTags: ["Customers"],
    }),

    getCustomerById: builder.query<{ success: boolean; data: CustomerDetailResponse }, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "CustomerDetail", id }],
    }),

    createCustomer: builder.mutation<
      { success: boolean; data: Customer },
      { name: string; phone: string; email?: string; notes?: string }
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customers"],
    }),

    updateCustomer: builder.mutation<
      { success: boolean; data: Customer },
      { id: string; name?: string; phone?: string; email?: string; notes?: string; loyaltyPoints?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => ["Customers", { type: "CustomerDetail", id }],
    }),

    deleteCustomer: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),

    adjustLoyaltyPoints: builder.mutation<
      { success: boolean; data: any; message: string },
      { id: string; points: number; reason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}/loyalty`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => ["Customers", { type: "CustomerDetail", id }],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useAdjustLoyaltyPointsMutation,
} = customerApi;
