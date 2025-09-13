// services/orderApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  paymentMethod: "cash" | "card" | "online";
}

export interface UpdateOrderPayload {
  status?: "pending" | "preparing" | "served" | "cancelled";
  paymentMethod?: "cash" | "card" | "online";
}
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({ baseUrl : baseUrl + "/api/orders" }),
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    // Create new order
    createOrder: builder.mutation({
      query: (order) => ({
        url: "/",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["Orders"],
    }),

    // Get all orders
    getOrders: builder.query({
      query: () => "/",
      providesTags: ["Orders"],
    }),

    // Get order by ID
    getOrderById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Orders"],
    }),

    // Update order (status or payment)
    updateOrder: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Orders"],
    }),

    // Delete order
    deleteOrder: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = orderApi;
