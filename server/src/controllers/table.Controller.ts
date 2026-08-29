import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Table } from "../models/Table";
import { io } from "../index";
import { broadcastStats } from "../utils/broadcastStats";

// Get all tables
export const getAllTables = async (req: AuthRequest, res: Response) => {
  try {
    const tables = await Table.find()
      .populate({
        path: "activeOrder",
        populate: { path: "items.product customer" },
      })
      .sort({ section: 1, name: 1 });
    res.json({ success: true, tables });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create table
export const createTable = async (req: AuthRequest, res: Response) => {
  try {
    const { name, seats, section, shape, posX, posY } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Table name is required" });
    }
    const table = await Table.create({
      name,
      seats: Number(seats) || 4,
      section: section || "Main Hall",
      shape: shape || "square",
      posX: Number(posX) || 0,
      posY: Number(posY) || 0,
      status: "free",
    });

    io.emit("tableAdded", table);
    await broadcastStats();
    res.status(201).json({ success: true, table });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update table status
export const updateTableStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, activeOrder } = req.body;
    const update: any = { status };
    if (activeOrder !== undefined) update.activeOrder = activeOrder || null;

    const table = await Table.findByIdAndUpdate(id, update, { new: true });
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

// Update table attributes (name, seats, section, shape, floor position)
export const updateTable = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, seats, section, shape, posX, posY, status } = req.body;

    const update: any = {};
    if (name) update.name = name;
    if (seats !== undefined) update.seats = Number(seats);
    if (section) update.section = section;
    if (shape) update.shape = shape;
    if (posX !== undefined) update.posX = Number(posX);
    if (posY !== undefined) update.posY = Number(posY);
    if (status) update.status = status;

    const table = await Table.findByIdAndUpdate(id, update, { new: true });

    if (!table) {
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });
    }

    io.emit("tableUpdated", table);
    await broadcastStats();
    res.json({ success: true, table });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Batch update table layout (Floor Plan editor drag save)
export const updateTableLayout = async (req: AuthRequest, res: Response) => {
  try {
    const { tables } = req.body;
    if (!Array.isArray(tables)) {
      return res.status(400).json({ success: false, message: "Tables array required" });
    }

    for (const t of tables) {
      if (t._id) {
        await Table.findByIdAndUpdate(t._id, {
          posX: Number(t.posX) || 0,
          posY: Number(t.posY) || 0,
          section: t.section || "Main Hall",
          shape: t.shape || "square",
        });
      }
    }

    const updatedTables = await Table.find().sort({ section: 1, name: 1 });
    io.emit("tableStatsUpdated", { total: updatedTables.length });
    res.json({ success: true, tables: updatedTables, message: "Floor plan layout saved" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete table
export const deleteTable = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const table = await Table.findByIdAndDelete(id);
    if (!table)
      return res
        .status(404)
        .json({ success: false, message: "Table not found" });

    io.emit("tableDeleted", id);
    await broadcastStats();
    res.json({ success: true, message: "Table deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get table stats
export const getTableStats = async (req: AuthRequest, res: Response) => {
  try {
    const total = await Table.countDocuments();
    const available = await Table.countDocuments({ status: "free" });
    const occupied = await Table.countDocuments({ status: "occupied" });
    const reserved = await Table.countDocuments({ status: "reserved" });
    res.json({ total, available, occupied, reserved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
