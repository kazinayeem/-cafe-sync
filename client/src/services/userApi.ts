import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl + "/api/users",
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as any).auth?.token || localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // ✅ Login User
    loginUser: builder.mutation<
      { token: string; user: any },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),

    updateUserProfile: builder.mutation<
      any,
      { name?: string; email?: string; password?: string }
    >({
      query: (data) => ({
        url: "/profile",
        method: "PUT",
        body: data,
      }),
    }),
    getUserProfile: builder.query<any, void>({
      query: () => "/profile",
    }),
  }),
});

export const {
  useLoginUserMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = userApi;
