import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface SelectedModifierPayload {
  groupId?: string;
  groupName: string;
  optionName: string;
  price: number;
}

export interface OrderItemPayload {
  productId: string;
  name?: string;
  quantity: number;
  size: string;
  price: number;
  modifiersPrice?: number;
  selectedModifiers?: SelectedModifierPayload[];
  itemNote?: string;
}

export interface PaymentRecordPayload {
  method: "cash" | "card" | "online" | "bkash" | "nagad" | "loyalty";
  amount: number;
  transactionId?: string;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  orderType?: "dine_in" | "takeaway" | "delivery";
  paymentMethod?: "cash" | "card" | "online" | "bkash" | "nagad" | "split";
  payments?: PaymentRecordPayload[];
  tableId?: string;
  customerId?: string;
  discountPercent?: number;
  taxRate?: number;
  serviceChargeRate?: number;
  orderNote?: string;
  loyaltyPointsUsed?: number;
}

export interface UpdateOrderPayload {
  status?: "pending" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled";
  paymentStatus?: "unpaid" | "paid" | "partial" | "refunded" | "partially_refunded";
  paymentMethod?: string;
  tableId?: string | null;
  payments?: PaymentRecordPayload[];
}

export interface Order {
  _id: string;
  customOrderID: string;
  orderToken?: string;
  source?: "pos" | "qr" | "online";
  guestName?: string;
  guestPhone?: string;
  customer?: { _id: string; name: string; phone: string; email?: string; loyaltyPoints?: number };
  orderType: "dine_in" | "takeaway" | "delivery";
  items: {
    product: { _id: string; name: string; imageUrl?: string; category?: string };
    name?: string;
    quantity: number;
    size: string;
    price: number;
    modifiersPrice?: number;
    selectedModifiers?: SelectedModifierPayload[];
    itemNote?: string;
  }[];
  subtotal: number;
  totalPrice: number;
  discountPercent: number;
  discountAmount: number;
  loyaltyPointsUsed?: number;
  loyaltyDiscount?: number;
  taxRate: number;
  taxAmount: number;
  serviceChargeRate?: number;
  serviceChargeAmount?: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled";
  paymentStatus?: "unpaid" | "paid" | "partial" | "refunded" | "partially_refunded";
  paymentMethod: string;
  payments?: PaymentRecordPayload[];
  table?: { _id: string; name: string };
  orderNote?: string;
  cashier?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface SalesSummaryResponse {
  summary: {
    totalOrders: number;
    totalSales: number;
  };
  statusBreakdown: { _id: string; count: number }[];
  allData: Record<string, Order[]>;
}

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: createCustomBaseQuery("/api/orders"),
  tagTypes: ["Orders", "Summary", "Chart"],
  endpoints: (builder) => ({
    createOrder: builder.mutation<{ success: boolean; data: Order }, CreateOrderPayload>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders", "Summary", "Chart"],
    }),

    getOrders: builder.query<
      {
        success: boolean;
        data: Order[];
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
        status?: string;
        paymentStatus?: string;
        paymentMethod?: string;
        startDate?: string;
        endDate?: string;
        orderId?: string;
      } | void
    >({
      query: (params) => {
        let url = "/";
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.set("page", String(params.page));
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.status && params.status !== "all") queryParams.set("status", params.status);
        if (params?.paymentStatus && params.paymentStatus !== "all") queryParams.set("paymentStatus", params.paymentStatus);
        if (params?.paymentMethod && params.paymentMethod !== "all") queryParams.set("paymentMethod", params.paymentMethod);
        if (params?.startDate) queryParams.set("startDate", params.startDate);
        if (params?.endDate) queryParams.set("endDate", params.endDate);
        if (params?.orderId) queryParams.set("orderId", params.orderId);
        const qs = queryParams.toString();
        return qs ? `${url}?${qs}` : url;
      },
      providesTags: ["Orders"],
    }),

    getKdsOrders: builder.query<{ success: boolean; data: Order[] }, void>({
      query: () => "/kds",
      providesTags: ["Orders"],
    }),

    getOrderById: builder.query<{ success: boolean; data: Order }, string>({
      query: (id) => `/${id}`,
      providesTags: ["Orders"],
    }),

    updateOrderStatus: builder.mutation<
      { success: boolean; data: Order },
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders", "Summary", "Chart"],
    }),

    updateOrder: builder.mutation<
      { success: boolean; data: Order },
      { id: string; data: UpdateOrderPayload }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Orders", "Summary", "Chart"],
    }),

    refundOrder: builder.mutation<
      { success: boolean; data: Order; message: string },
      { id: string; amount?: number; reason: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}/refund`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders", "Summary", "Chart"],
    }),

    deleteOrder: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Orders", "Summary", "Chart"],
    }),

    getSalesSummary: builder.query<
      SalesSummaryResponse,
      {
        startDate: string;
        endDate: string;
        status?: string;
        search?: string;
      }
    >({
      query: ({ startDate, endDate, status, search }) => {
        let url = "/summary/report?";
        url += `startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&`;
        if (status && status !== "all") url += `status=${encodeURIComponent(status)}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        return url;
      },
      providesTags: ["Summary"],
    }),

    getSalesByDateRange: builder.query<
      { success: boolean; data: { date: string; totalSales: number; totalOrders: number }[] },
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) =>
        `/sales/last-7-days?startDate=${encodeURIComponent(
          startDate
        )}&endDate=${encodeURIComponent(endDate)}`,
      providesTags: ["Chart"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetKdsOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useRefundOrderMutation,
  useDeleteOrderMutation,
  useGetSalesSummaryQuery,
  useGetSalesByDateRangeQuery,
} = orderApi;
