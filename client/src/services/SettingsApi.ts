import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface SettingsData {
  taxRate: number;
  discountRate: number;
  currency: string;
  serviceCharge?: number;
  businessName: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  receiptFooter?: string;
  showTableName?: boolean;
  enableDiscountInput: boolean;
  enableTaxOverride: boolean;
  allowNegativeStock: boolean;
  enableLoyalty?: boolean;
  loyaltyEarnRate?: number;
  loyaltyRedeemRate?: number;
  openingTime: string;
  closingTime: string;
  offDays: string[];
  lowStockAlertLevel?: number;
  salesTarget?: number;
  permissions?: Record<string, string[]>;
}

export const settingsApi = createApi({
  reducerPath: "settingsApi",
  baseQuery: createCustomBaseQuery("/api/settings"),
  tagTypes: ["Settings"],
  endpoints: (builder) => ({
    getSettings: builder.query<{ success: boolean; data: SettingsData }, any>({
      query: () => "/",
      providesTags: ["Settings"],
    }),

    updateSettings: builder.mutation<
      { success: boolean; data: SettingsData },
      Partial<SettingsData>
    >({
      query: (body) => ({
        url: "/",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
