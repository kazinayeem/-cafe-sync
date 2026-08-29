import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface ProductSize {
  small?: number;
  large?: number;
  extraLarge?: number;
}

export interface Product {
  _id: string;
  name: string;
  category?: { _id: string; name: string };
  description?: string;
  imageUrl?: string;
  available: boolean;
  stockQuantity: number;
  minStockLevel: number;
  trackInventory: boolean;
  unit: string;
  sizes: ProductSize;
  modifierGroups?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: createCustomBaseQuery("/api/products"),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[] | { data: Product[] }, void>({
      query: () => "/",
      providesTags: ["Products"],
    }),

    getProductsByCategory: builder.query<Product[], string>({
      query: (categoryId) => `/category/${categoryId}`,
      providesTags: ["Products"],
    }),

    searchProducts: builder.query<Product[], string>({
      query: (q) => `/search?q=${encodeURIComponent(q)}`,
      providesTags: ["Products"],
    }),

    createProduct: builder.mutation<Product, FormData>({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation<Product, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Products"],
    }),

    deleteProduct: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductsByCategoryQuery,
  useSearchProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
