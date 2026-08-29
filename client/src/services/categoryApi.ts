import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface Category {
  _id: string;
  name: string;
  items?: any[];
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: createCustomBaseQuery("/api/categories"),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => "/",
      transformResponse: (res: any) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
      },
      providesTags: ["Category"],
    }),

    addCategory: builder.mutation<Category, { name: string }>({
      query: (category) => ({
        url: "/",
        method: "POST",
        body: category,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<Category, { id: string; name: string }>({
      query: ({ id, name }) => ({
        url: `/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
