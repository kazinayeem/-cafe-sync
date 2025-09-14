// controllers/orderController.ts
import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Table } from "../models/Table";
import { Types } from "mongoose";
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
// export const getTodayOrderSummary = async (req: Request, res: Response) => {
//   try {
//     // Today's start and end
//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date();
//     endOfDay.setHours(23, 59, 59, 999);

//     // Aggregate orders created today
//     const summary = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: startOfDay, $lte: endOfDay },
//         },
//       },
//       {
//         $group: {
//           _id: "$status", // group by order status
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     // Convert result into an object (e.g., { served: 3, waiting: 2 })
//     const statusCounts: Record<string, number> = {};
//     summary.forEach((s) => {
//       statusCounts[s._id] = s.count;
//     });

//     // Also include total orders
//     const totalOrders = summary.reduce((sum, s) => sum + s.count, 0);

//     return res.status(200).json({
//       success: true,
//       data: {
//         totalOrders,
//         ...statusCounts,
//       },
//     });
//   } catch (err: any) {
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

// Create new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, totalPrice, paymentMethod, tableId } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    const order = await Order.create({
      items,
      totalPrice,
      paymentMethod: paymentMethod || "cash",
      table: tableId,
    });
    await order.populate("table items.product");
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
    const orders = await Order.find()
      .populate("items.product")
      .populate("table")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
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
