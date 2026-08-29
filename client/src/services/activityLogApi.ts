import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface ActivityLogItem {
  _id: string;
  user?: { _id: string; name: string; email: string; role: string };
  action: string;
  category: "order" | "inventory" | "auth" | "shift" | "payment" | "table" | "settings";
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export const activityLogApi = createApi({
  reducerPath: "activityLogApi",
  baseQuery: createCustomBaseQuery("/api/activity-logs"),
  tagTypes: ["ActivityLogs"],
  endpoints: (builder) => ({
    getActivityLogs: builder.query<
      { success: boolean; data: ActivityLogItem[] },
      { limit?: number; category?: string } | void
    >({
      query: (params) => {
        let url = "/";
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set("limit", String(params.limit));
        if (params?.category) queryParams.set("category", params.category);
        const qs = queryParams.toString();
        return qs ? `${url}?${qs}` : url;
      },
      providesTags: ["ActivityLogs"],
    }),
  }),
});

export const { useGetActivityLogsQuery } = activityLogApi;
