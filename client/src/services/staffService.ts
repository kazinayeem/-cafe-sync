import type { IUser } from "@/types/User";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL =  process.env.VITE_API_BASE_URL || "https://cafe-sync-mhnc.vercel.app/api";

export interface StaffInput {
  name: string;
  email: string;
  role: string;
  phone?: string;
  password?: string;
  isActive?: boolean;
}

export const staffApi = createApi({
  reducerPath: "staffApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Staff"],
  endpoints: (builder) => ({
    getAllStaff: builder.query({
      query: () => "/staff",
      providesTags: ["Staff"],
    }),
    addStaff: builder.mutation({
      query: (staff) => ({
        url: "/staff",
        method: "POST",
        body: staff,
      }),
      invalidatesTags: ["Staff"],
    }),
    updateStaff: builder.mutation<
      IUser,
      { id: string; data: Partial<StaffInput> }
    >({
      query: ({ id, data }) => ({
        url: `/staff/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Staff"],
    }),
    deleteStaff: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/staff/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),
    toggleStaffActive: builder.mutation<
      IUser,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/staff/${id}/active`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useGetAllStaffQuery,
  useAddStaffMutation,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useToggleStaffActiveMutation,
} = staffApi;
