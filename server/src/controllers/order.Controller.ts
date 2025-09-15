// controllers/orderController.ts
import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Table } from "../models/Table";
import mongoose, { Types } from "mongoose";
import { getTodayOrderSummary } from "./orderSummaryService";
import { io } from "..";

export const getTodayOrderSummaryController = async (
  req: Request,
  res: Response
) => {
  try {
    const summary = await getTodayOrderSummary();
    return res.status(200).json({ success: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Create new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, paymentMethod, tableId } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    // Calculate total price based on item prices and quantities
    const totalPrice = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Create the order
    const order = await Order.create({
      items, // each item must have: product, quantity, size, price
      totalPrice,
      paymentMethod: paymentMethod || "cash",
      table: tableId || null,
    });

    // Populate references for response
    await order.populate("table items.product");

    // Emit live update to frontend
    const summary = await getTodayOrderSummary();
    io.emit("orderSummaryUpdate", summary);

    return res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all orders

export const getOrders = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      orderId,
    } = req.query;

    const query: any = {};

    // Filter by status
    if (status && status !== "all") query.status = status;

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Fetch all matching orders first (without _id filter)
    const orders = await Order.find(query)
      .populate("table items.product")
      .sort({ createdAt: -1 });

    // Partial _id search in JS
    let filteredOrders = orders;
    if (orderId) {
      const searchTerm = (orderId as string).toLowerCase();
      filteredOrders = orders.filter((order) => {
        const idStr =
          order._id instanceof Types.ObjectId
            ? order._id.toString()
            : String(order._id);
        return idStr.toLowerCase().startsWith(searchTerm);
      });
    }

    // Pagination
    const total = filteredOrders.length;
    const paginatedOrders = filteredOrders.slice(
      (Number(page) - 1) * Number(limit),
      Number(page) * Number(limit)
    );

    return res.json({
      data: paginatedOrders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get single order
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("items.product")
      .populate("table");

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update order (status, paymentMethod, table)
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod, tableId } = req.body;

    const order = await Order.findById(id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (status) order.status = status;
    if (paymentMethod) order.paymentMethod = paymentMethod;

    if (tableId) {
      const table = await Table.findById(tableId);
      if (!table)
        return res
          .status(404)
          .json({ success: false, message: "Table not found" });
      order.table = table._id as Types.ObjectId;
    }

    await order.save();
    const summary = await getTodayOrderSummary();
    io.emit("orderSummaryUpdate", summary);
    console.log(summary);

    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete order
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    return res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
