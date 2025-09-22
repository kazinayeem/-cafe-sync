// controllers/orderController.ts
import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Table } from "../models/Table";
import { Types } from "mongoose";
import { getTodayOrderSummary } from "./orderSummaryService.controller";
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

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, paymentMethod, tableId, discountPercent, taxRate } =
      req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    const totalPrice = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      items,
      totalPrice,
      discountPercent,
      taxRate,
      paymentMethod: paymentMethod || "cash",
      table: tableId || null,
    });
    await order.populate("table items.product");
    const summary = await getTodayOrderSummary();
    io.emit("orderSummaryUpdate", summary);
    return res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

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
    if (status && status !== "all") query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // 🔎 If searching by customOrderID
    if (orderId) {
      query.customOrderID = {
        $regex: new RegExp(orderId as string, "i"),
      };
    }

    const orders = await Order.find(query)
      .populate("table")
      .populate({
        path: "items.product",
        select: "-imageUrl",
      })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    return res.json({
      data: orders,
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

    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

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
