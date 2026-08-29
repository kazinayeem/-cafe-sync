import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const getBaseApiUrl = (): string => {
  return (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000"
  );
};

export const createCustomBaseQuery = (path: string = "") => {
  return fetchBaseQuery({
    baseUrl: `${getBaseApiUrl()}${path}`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });
};

export const baseQueryWithAuth = createCustomBaseQuery("");
