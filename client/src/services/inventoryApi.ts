import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface InventoryItem {
  _id: string;
  name: string;
  category?: { _id: string; name: string };
  stockQuantity: number;
  minStockLevel: number;
  trackInventory: boolean;
  unit: string;
  available: boolean;
  imageUrl?: string;
  sizes?: { small?: number; large?: number; extraLarge?: number };
}

export interface InventorySummary {
  totalSKUs: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface InventoryResponse {
  summary: InventorySummary;
  items: InventoryItem[];
}

export interface InventoryMovement {
  _id: string;
  product: { _id: string; name: string; unit: string };
  type: "in" | "out" | "adjustment" | "order" | "waste";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  order?: string;
  staff?: { _id: string; name: string; role: string };
  createdAt: string;
}

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: createCustomBaseQuery("/api/inventory"),
  tagTypes: ["Inventory", "InventoryHistory"],
  endpoints: (builder) => ({
    getInventory: builder.query<
      { success: boolean; data: InventoryResponse },
      { filter?: string; search?: string } | void
    >({
      query: (params) => {
        let url = "/";
        const queryParams = new URLSearchParams();
        if (params?.filter) queryParams.set("filter", params.filter);
        if (params?.search) queryParams.set("search", params.search);
        const qs = queryParams.toString();
        return qs ? `${url}?${qs}` : url;
      },
      providesTags: ["Inventory"],
    }),

    adjustStock: builder.mutation<
      { success: boolean; data: { product: InventoryItem; movement: InventoryMovement }; message: string },
      {
        productId: string;
        type: "in" | "out" | "adjustment" | "waste";
        quantity: number;
        reason?: string;
        newStockLevel?: number;
        minStockLevel?: number;
      }
    >({
      query: (body) => ({
        url: "/adjust",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Inventory", "InventoryHistory"],
    }),

    getInventoryHistory: builder.query<
      { success: boolean; data: InventoryMovement[] },
      { productId?: string; limit?: number } | void
    >({
      query: (params) => {
        let url = "/history";
        const queryParams = new URLSearchParams();
        if (params?.productId) queryParams.set("productId", params.productId);
        if (params?.limit) queryParams.set("limit", String(params.limit));
        const qs = queryParams.toString();
        return qs ? `${url}?${qs}` : url;
      },
      providesTags: ["InventoryHistory"],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useAdjustStockMutation,
  useGetInventoryHistoryQuery,
} = inventoryApi;
