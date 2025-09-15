import { Request, Response } from "express";
import { Table } from "../models/Table";
import { io } from "..";
import { broadcastStats } from "../utils/broadcastStats";

// Get all tables
export const getAllTables = async (req: Request, res: Response) => {
  const tables = await Table.find();
  res.json({ success: true, tables });
};

// Create table
export const createTable = async (req: Request, res: Response) => {
  try {
    const { name, seats } = req.body;
    if (!name || !seats) {
      return res
        .status(400)
        .json({ success: false, message: "Name and seats are required" });
    }
    const table = await Table.create({ name, seats });
    io.emit("tableAdded", table);
    await broadcastStats();
    res.json({ success: true, table });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update table status
export const updateTableStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const table = await Table.findByIdAndUpdate(id, { status }, { new: true });
    if (!table)
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    io.emit("tableStatusUpdated", { id: table._id, status: table.status });
    await broadcastStats();
    res.json({ success: true, table });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update table name
// Update table name and seats
export const updateTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, seats } = req.body;

    if (!name && seats === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name or seats) is required",
      });
    }

    const update: any = {};
    if (name) update.name = name;
    if (seats !== undefined) update.seats = seats;

    const table = await Table.findByIdAndUpdate(id, update, { new: true });

    if (!table) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }

    io.emit("tableUpdated", table); // notify frontend
    res.json({ success: true, table });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete table
export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const table = await Table.findByIdAndDelete(id);
    if (!table)
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    io.emit("tableDeleted", id); // frontend can remove the table from UI
    await broadcastStats();
    res.json({ success: true, message: "Table deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get table stats
export const getTableStats = async (req: Request, res: Response) => {
  try {
    const total = await Table.countDocuments();
    const available = await Table.countDocuments({ status: "free" });
    io.emit("tableStatsUpdated", { total, available });
    res.json({ total, available });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err });
  }
};
