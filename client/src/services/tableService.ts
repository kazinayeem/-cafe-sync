import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery, getBaseApiUrl } from "./apiConfig";
import axios from "axios";

export interface Table {
  _id: string;
  name: string;
  seats: number;
  section: string;
  shape: "square" | "round" | "rectangle";
  posX: number;
  posY: number;
  status: "free" | "occupied" | "reserved" | "cleaning";
  qrToken?: string;
  activeOrder?: any;
  createdAt?: string;
  updatedAt?: string;
}

export const tableApi = createApi({
  reducerPath: "tableApi",
  baseQuery: createCustomBaseQuery("/api/tables"),
  tagTypes: ["Tables", "TableStats"],
  endpoints: (builder) => ({
    getTables: builder.query<{ success: boolean; tables: Table[] }, void>({
      query: () => "/",
      providesTags: ["Tables"],
    }),

    addTable: builder.mutation<
      { success: boolean; table: Table },
      { name: string; seats: number; section?: string; shape?: string; posX?: number; posY?: number }
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tables", "TableStats"],
    }),

    updateTableStatus: builder.mutation<
      { success: boolean; table: Table },
      { id: string; status: string; activeOrder?: string | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}/status`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tables", "TableStats"],
    }),

    regenerateTableQr: builder.mutation<
      { success: boolean; table: Table; message: string },
      string
    >({
      query: (id) => ({
        url: `/${id}/regenerate-qr`,
        method: "POST",
      }),
      invalidatesTags: ["Tables"],
    }),

    updateTable: builder.mutation<
      { success: boolean; table: Table },
      { id: string; name?: string; seats?: number; section?: string; shape?: string; posX?: number; posY?: number; status?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Tables", "TableStats"],
    }),

    updateTableLayout: builder.mutation<
      { success: boolean; tables: Table[]; message: string },
      { tables: Partial<Table>[] }
    >({
      query: (body) => ({
        url: "/layout",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Tables"],
    }),

    deleteTable: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tables", "TableStats"],
    }),

    getTableStats: builder.query<
      { total: number; available: number; occupied: number; reserved: number },
      void
    >({
      query: () => "/stats",
      providesTags: ["TableStats"],
    }),
  }),
});

export const {
  useGetTablesQuery,
  useAddTableMutation,
  useUpdateTableStatusMutation,
  useRegenerateTableQrMutation,
  useUpdateTableMutation,
  useUpdateTableLayoutMutation,
  useDeleteTableMutation,
  useGetTableStatsQuery,
} = tableApi;

// Backward-compatible Axios wrappers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getTables = async () => {
  const res = await axios.get(`${getBaseApiUrl()}/api/tables`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const addTable = async (name: string, seats: number) => {
  const res = await axios.post(
    `${getBaseApiUrl()}/api/tables`,
    { name, seats },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const updateTableStatus = async (id: string, status: string) => {
  const res = await axios.post(
    `${getBaseApiUrl()}/api/tables/${id}/status`,
    { status },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const updateTable = async (
  id: string,
  name?: string,
  seats?: number
) => {
  const res = await axios.put(
    `${getBaseApiUrl()}/api/tables/${id}`,
    { name, seats },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const deleteTable = async (id: string) => {
  const res = await axios.delete(`${getBaseApiUrl()}/api/tables/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};
