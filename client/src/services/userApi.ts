import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: createCustomBaseQuery("/api/users"),
  endpoints: (builder) => ({
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
