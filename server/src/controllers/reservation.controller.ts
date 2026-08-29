import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Reservation } from "../models/Reservation";
import { Table } from "../models/Table";
import { io } from "../index";

// Get reservations (filter by date or status)
export const getReservations = async (req: AuthRequest, res: Response) => {
  try {
    const { date, status } = req.query;
    const query: any = {};
    if (date) query.date = date;
    if (status && status !== "all") query.status = status;

    const reservations = await Reservation.find(query)
      .populate("table", "name seats section")
      .sort({ date: 1, time: 1 });

    return res.json({ success: true, data: reservations });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new reservation
export const createReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { customerName, phone, email, date, time, guests, tableId, specialRequests } =
      req.body;

    if (!customerName || !phone || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Customer name, phone, date, and time are required",
      });
    }

    const reservation = await Reservation.create({
      customerName,
      phone,
      email,
      date,
      time,
      guests: Number(guests) || 2,
      table: tableId || null,
      specialRequests,
      status: "upcoming",
    });

    if (tableId) {
      await Table.findByIdAndUpdate(tableId, { status: "reserved" });
      io.emit("tableStatusUpdated", { id: tableId, status: "reserved" });
    }

    io.emit("reservationUpdated", reservation);

    return res.status(201).json({ success: true, data: reservation });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update reservation status
export const updateReservationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, tableId } = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: "Reservation not found" });
    }

    if (status) reservation.status = status;
    if (tableId !== undefined) reservation.table = tableId || null;

    await reservation.save();

    // Table state updates based on reservation status
    if (reservation.table) {
      if (status === "seated") {
        await Table.findByIdAndUpdate(reservation.table, { status: "occupied" });
        io.emit("tableStatusUpdated", { id: reservation.table, status: "occupied" });
      } else if (status === "completed" || status === "cancelled" || status === "no_show") {
        await Table.findByIdAndUpdate(reservation.table, { status: "free" });
        io.emit("tableStatusUpdated", { id: reservation.table, status: "free" });
      }
    }

    io.emit("reservationUpdated", reservation);

    return res.json({ success: true, data: reservation });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete reservation
export const deleteReservation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByIdAndDelete(id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: "Reservation not found" });
    }

    if (reservation.table && reservation.status === "upcoming") {
      await Table.findByIdAndUpdate(reservation.table, { status: "free" });
      io.emit("tableStatusUpdated", { id: reservation.table, status: "free" });
    }

    return res.json({ success: true, message: "Reservation deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
