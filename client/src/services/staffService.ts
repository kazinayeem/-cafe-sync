import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface Staff {
  _id: string;
  name: string;
  email: string;
  role: string;
  position?: string;
  active: boolean;
  permissions?: string[];
  createdAt?: string;
}

export const staffApi = createApi({
  reducerPath: "staffApi",
  baseQuery: createCustomBaseQuery("/api/users"),
  tagTypes: ["Staff"],
  endpoints: (builder) => ({
    getAllStaff: builder.query<{ success: boolean; staffs: Staff[] }, void>({
      query: () => "/staff",
      providesTags: ["Staff"],
    }),

    addStaff: builder.mutation<
      { success: boolean; staff: Staff },
      { name: string; email: string; role?: string; position?: string; password?: string; permissions?: string[] }
    >({
      query: (body) => ({
        url: "/staff",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Staff"],
    }),

    updateStaff: builder.mutation<
      { success: boolean; staff: Staff },
      { id: string; data: { name?: string; email?: string; role?: string; position?: string; active?: boolean; password?: string; permissions?: string[] } }
    >({
      query: ({ id, data }) => ({
        url: `/staff/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Staff"],
    }),

    toggleStaffActive: builder.mutation<
      { success: boolean; staff: Staff },
      { id: string; isActive?: boolean }
    >({
      query: ({ id }) => ({
        url: `/staff/${id}/active`,
        method: "PATCH",
      }),
      invalidatesTags: ["Staff"],
    }),

    deleteStaff: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/staff/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useGetAllStaffQuery,
  useAddStaffMutation,
  useUpdateStaffMutation,
  useToggleStaffActiveMutation,
  useDeleteStaffMutation,
} = staffApi;
