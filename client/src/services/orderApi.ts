import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface OrderItemPayload {
  productId: string;
  quantity: number;
  size: string;
  price: number;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  paymentMethod: "cash" | "card" | "online";
  tableId?: string;
}

export interface UpdateOrderPayload {
  status?: "pending" | "preparing" | "served" | "cancelled";
  paymentMethod?: "cash" | "card" | "online";
}

// Define the Order type to be used in the allData object
interface Order {
  _id: string;
  table?: { tableNumber: string };
  status: string;
  totalPrice: number;
  paymentMethod: string;
  createdAt: string;
}

// Define the StatusBreakdown type
export interface StatusBreakdown {
  _id: "pending" | "preparing" | "served" | "cancelled";
  count: number;
}

// Define the AllData type
export interface AllData {
  pending?: Order[];
  preparing?: Order[];
  served?: Order[];
  cancelled?: Order[];
}

// 📊 Corrected Sales Summary Response type to match API response
export interface SalesSummaryResponse {
  summary: {
    totalOrders: number;
    totalSales: number;
  };
  statusBreakdown: StatusBreakdown[];
  allData: AllData;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({ baseUrl: baseUrl + "/api/orders" }),
  tagTypes: ["Orders", "Summary"],
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: "/",
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["Orders", "Summary"],
    }),

    // Get all orders
    getOrders: builder.query<
      {
        data: any[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      },
      {
        page?: number;
        limit?: number;
        status?: "pending" | "preparing" | "served" | "cancelled";
        startDate?: string;
        endDate?: string;
      }
    >({
      query: ({ page = 1, limit = 10, status, startDate, endDate } = {}) => {
        let url = `/?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        return url;
      },
      providesTags: ["Orders"],
    }),

    // Get order by ID
    getOrderById: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Orders"],
    }),

    // Update order
    updateOrder: builder.mutation({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Orders", "Summary"],
    }),

    // Delete order
    deleteOrder: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders", "Summary"],
    }),

    // 📊 Get Sales Summary
    getSalesSummary: builder.query<
      SalesSummaryResponse,
      {
        filter?: "today" | "week" | "month";
        startDate?: string;
        endDate?: string;
        status?: string;
      }
    >({
      query: ({ filter, startDate, endDate, status } = {}) => {
        let url = `/summary/report?`;
        if (filter) url += `filter=${filter}&`;
        if (startDate) url += `startDate=${startDate}&`;
        if (endDate) url += `endDate=${endDate}&`;
        if (status) url += `status=${status}&`;
        return url;
      },
      providesTags: ["Summary"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetSalesSummaryQuery,
} = orderApi;
