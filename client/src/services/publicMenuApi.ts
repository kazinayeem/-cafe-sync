import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getBaseApiUrl } from "./apiConfig";

export interface PublicMenuResponse {
  business: {
    name: string;
    address: string;
    phone: string;
    website: string;
    currency: string;
    openingTime: string;
    closingTime: string;
    offDays: string[];
  };
  categories: { _id: string; name: string }[];
  products: any[];
}

export const publicMenuApi = createApi({
  reducerPath: "publicMenuApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${getBaseApiUrl()}/api/public` }),
  endpoints: (builder) => ({
    getPublicMenu: builder.query<{ success: boolean; data: PublicMenuResponse }, void>({
      query: () => "/menu",
    }),
  }),
});

export const { useGetPublicMenuQuery } = publicMenuApi;
