import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl + "/api/settings",
  }),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    // GET /api/settings
    getSettings: builder.query({
      query: () => "/",
      providesTags: ["Settings"],
    }),
    // PUT /api/settings
    updateSettings: builder.mutation({
      query: (body) => ({
        url: "/",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

// Export hooks for usage in components
export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
