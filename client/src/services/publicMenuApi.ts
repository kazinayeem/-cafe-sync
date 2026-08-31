import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseApiUrl } from "./apiConfig";

export interface BusinessInfo {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  currency?: string;
  openingTime?: string;
  closingTime?: string;
  offDays?: string[];
  taxRate?: number;
  serviceCharge?: number;
  enableCustomerSelfOrdering?: boolean;
}

export interface PublicMenuResponse {
  business: BusinessInfo;
  categories: { _id: string; name: string }[];
  products: any[];
}

export interface TableQrResponse {
  table: {
    _id: string;
    name: string;
    section: string;
    seats: number;
    status: string;
    qrToken: string;
  };
  business: BusinessInfo;
  categories: { _id: string; name: string }[];
  products: any[];
}

export interface CreateQrOrderPayload {
  qrToken: string;
  items: {
    productId: string;
    quantity: number;
    size: string;
    selectedModifiers?: {
      groupName: string;
      optionName: string;
      price: number;
    }[];
    itemNote?: string;
  }[];
  guestName?: string;
  guestPhone?: string;
  orderNote?: string;
}

export interface TrackOrderResponse {
  order: {
    _id: string;
    customOrderID: string;
    orderToken: string;
    source: "pos" | "qr" | "online";
    guestName?: string;
    guestPhone?: string;
    orderType: string;
    items: {
      product: { _id: string; name: string; imageUrl?: string };
      name?: string;
      quantity: number;
      size: string;
      price: number;
      modifiersPrice?: number;
      selectedModifiers?: { groupName: string; optionName: string; price: number }[];
      itemNote?: string;
    }[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    serviceChargeRate: number;
    serviceChargeAmount: number;
    totalPrice: number;
    status: "pending" | "confirmed" | "preparing" | "ready" | "served" | "completed" | "cancelled";
    paymentStatus: "unpaid" | "paid" | "partial" | "refunded" | "partially_refunded";
    table?: { _id: string; name: string; section?: string; seats?: number };
    orderNote?: string;
    createdAt: string;
    updatedAt: string;
  };
  business: {
    name: string;
    phone?: string;
    currency?: string;
  };
}

export interface DisplayOrderToken {
  _id: string;
  orderToken: string;
  customOrderID: string;
  status: string;
  table: string;
  updatedAt: string;
}

export interface DisplayOrdersResponse {
  preparing: DisplayOrderToken[];
  ready: DisplayOrderToken[];
  recentCompleted: DisplayOrderToken[];
}

export const publicMenuApi = createApi({
  reducerPath: "publicMenuApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${getBaseApiUrl()}/api/public` }),
  tagTypes: ["PublicMenu", "TableQr", "TrackOrder", "DisplayOrders"],
  endpoints: (builder) => ({
    getPublicMenu: builder.query<{ success: boolean; data: PublicMenuResponse }, void>({
      query: () => "/menu",
      providesTags: ["PublicMenu"],
    }),

    getTableByQrToken: builder.query<{ success: boolean; data: TableQrResponse }, string>({
      query: (qrToken: string) => `/tables/qr/${qrToken}`,
      providesTags: ["TableQr"],
    }),

    createQrOrder: builder.mutation<
      { success: boolean; data: any; message: string },
      CreateQrOrderPayload
    >({
      query: (body) => ({
        url: "/orders/qr",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DisplayOrders"],
    }),

    trackOrder: builder.query<{ success: boolean; data: TrackOrderResponse }, string>({
      query: (orderId: string) => `/orders/track/${orderId}`,
      providesTags: ["TrackOrder"],
    }),

    getDisplayOrders: builder.query<{ success: boolean; data: DisplayOrdersResponse }, void>({
      query: () => "/orders/display",
      providesTags: ["DisplayOrders"],
    }),
  }),
});

export const {
  useGetPublicMenuQuery,
  useGetTableByQrTokenQuery,
  useCreateQrOrderMutation,
  useTrackOrderQuery,
  useGetDisplayOrdersQuery,
} = publicMenuApi;
