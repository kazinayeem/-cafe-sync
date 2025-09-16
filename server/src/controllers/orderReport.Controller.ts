import { Request, Response } from "express";
import mongoose from "mongoose";
import { Order } from "../models/Order";

/**
 * Generate order report
 */
export const getOrderReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, status, search } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ success: false, message: "Start and End date required" });
    }

    // ✅ Use frontend dates directly
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const baseMatchQuery: Record<string, any> = {
      createdAt: { $gte: start, $lte: end },
    };

    if (status) baseMatchQuery.status = status;

    // 🔎 Unified search: Order ID OR Product Name
    let query = Order.find(baseMatchQuery)
      .populate("table")
      .populate("items.product");

    if (search) {
      if (mongoose.Types.ObjectId.isValid(search as string)) {
        // Search by orderId
        baseMatchQuery._id = new mongoose.Types.ObjectId(search as string);
      } else {
        // Search by productName
        query = query
          .where("items.product.name")
          .regex(new RegExp(search as string, "i"));
      }
    }

    const orders = await query.sort({ createdAt: -1 });

    // 📊 Summary aggregation
    const summaryAgg = await Order.aggregate([
      { $match: baseMatchQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const summary = summaryAgg[0] || { totalOrders: 0, totalSales: 0 };

    // 📊 Status breakdown aggregation
    const statusBreakdownAgg = await Order.aggregate([
      { $match: baseMatchQuery },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          sales: { $sum: "$totalPrice" },
        },
      },
    ]);
    const statusBreakdown = statusBreakdownAgg.length ? statusBreakdownAgg : [];

    // 📦 Organize orders by status
    const allData: Record<string, any[]> = {};
    orders.forEach((order) => {
      const key = order.status;
      if (!allData[key]) allData[key] = [];
      allData[key].push(order);
    });

    res.status(200).json({
      success: true,
      range: { start, end },
      summary,
      statusBreakdown,
      orders,
      allData,
      message:
        orders.length === 0 ? "No orders found in this date range" : undefined,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get last 7 days sales for chart
 */
export const getSalesLast7Days = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({
          success: false,
          message: "startDate and endDate are required",
        });
    }

    const start = new Date(startDate as string); // frontend should send ISO string with timezone
    const end = new Date(endDate as string);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing dates with 0
    const result: { date: string; totalSales: number; totalOrders: number }[] =
      [];
    const dayCount =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < dayCount; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);

      const found = salesData.find((s) => s._id === dateStr);
      result.push({
        date: dateStr,
        totalSales: found ? found.totalSales : 0,
        totalOrders: found ? found.totalOrders : 0,
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
