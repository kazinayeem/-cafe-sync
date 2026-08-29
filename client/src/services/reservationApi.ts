import { createApi } from "@reduxjs/toolkit/query/react";
import { createCustomBaseQuery } from "./apiConfig";

export interface Reservation {
  _id: string;
  customerName: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  guests: number;
  table?: { _id: string; name: string; seats: number; section: string };
  status: "upcoming" | "confirmed" | "seated" | "completed" | "cancelled" | "no_show";
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export const reservationApi = createApi({
  reducerPath: "reservationApi",
  baseQuery: createCustomBaseQuery("/api/reservations"),
  tagTypes: ["Reservations"],
  endpoints: (builder) => ({
    getReservations: builder.query<
      { success: boolean; data: Reservation[] },
      { date?: string; status?: string } | void
    >({
      query: (params) => {
        let url = "/";
        const queryParams = new URLSearchParams();
        if (params?.date) queryParams.set("date", params.date);
        if (params?.status) queryParams.set("status", params.status);
        const qs = queryParams.toString();
        return qs ? `${url}?${qs}` : url;
      },
      providesTags: ["Reservations"],
    }),

    createReservation: builder.mutation<
      { success: boolean; data: Reservation },
      {
        customerName: string;
        phone: string;
        email?: string;
        date: string;
        time: string;
        guests: number;
        tableId?: string;
        specialRequests?: string;
      }
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reservations"],
    }),

    updateReservationStatus: builder.mutation<
      { success: boolean; data: Reservation },
      { id: string; status: string; tableId?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reservations"],
    }),

    deleteReservation: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reservations"],
    }),
  }),
});

export const {
  useGetReservationsQuery,
  useCreateReservationMutation,
  useUpdateReservationStatusMutation,
  useDeleteReservationMutation,
} = reservationApi;
