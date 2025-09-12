// src/store/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const productApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query<any[], void>({
      query: () => "/api/products",
      providesTags: ["Product"],
    }),
    getProductById: builder.query<any, string>({
      query: (id) => `/api/products/${id}`,
      providesTags: ["Product"],
    }),
    getProductsByCategory: builder.query<any[], string>({
      query: (categoryId) => `/api/products/category/${categoryId}`,
      providesTags: ["Product"],
    }),
    searchProducts: builder.query<any[], string>({
      query: (q) => `/api/products/search?q=${q}`,
      providesTags: ["Product"],
    }),
    createProduct: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: "/api/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/api/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByCategoryQuery,
  useSearchProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
