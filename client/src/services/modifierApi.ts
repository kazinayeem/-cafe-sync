import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface ModifierOption {
  _id?: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface ModifierGroup {
  _id: string;
  name: string;
  required: boolean;
  minSelection: number;
  maxSelection: number;
  options: ModifierOption[];
  createdAt: string;
  updatedAt: string;
}

export const modifierApi = createApi({
  reducerPath: "modifierApi",
  baseQuery: createCustomBaseQuery("/api/modifiers"),
  tagTypes: ["Modifiers"],
  endpoints: (builder) => ({
    getModifierGroups: builder.query<{ success: boolean; data: ModifierGroup[] }, void>({
      query: () => "/",
      providesTags: ["Modifiers"],
    }),

    createModifierGroup: builder.mutation<
      { success: boolean; data: ModifierGroup },
      { name: string; required?: boolean; minSelection?: number; maxSelection?: number; options: ModifierOption[] }
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Modifiers"],
    }),

    updateModifierGroup: builder.mutation<
      { success: boolean; data: ModifierGroup },
      { id: string; name?: string; required?: boolean; minSelection?: number; maxSelection?: number; options?: ModifierOption[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Modifiers"],
    }),

    deleteModifierGroup: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Modifiers"],
    }),
  }),
});

export const {
  useGetModifierGroupsQuery,
  useCreateModifierGroupMutation,
  useUpdateModifierGroupMutation,
  useDeleteModifierGroupMutation,
} = modifierApi;
