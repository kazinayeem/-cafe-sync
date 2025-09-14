import { Request, Response } from "express";
import { Order } from "../models/Order";

/**
 * Utility to calculate date ranges
 */
const getDateRange = (filter: string, startDate?: string, endDate?: string) => {
  const now = new Date();
  let start: Date;
  let end: Date = new Date();

  switch (filter) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;

    case "thisWeek": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      end = new Date();
      break;
    }

    case "thisMonth":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;

    case "custom":
      if (!startDate || !endDate) throw new Error("Start and End date required for custom filter");
      start = new Date(startDate);
      end = new Date(endDate);
      // Make sure end date includes the full day
      end.setHours(23, 59, 59, 999);
      break;

    default:
      start = new Date(0); // very old date
      end = new Date();
  }

  return { start, end };
};

/**
 * Generate order report
 */
export const getOrderReport = async (req: Request, res: Response) => {
  try {
    const { filter = "today", startDate, endDate, status } = req.query;

    const { start, end } = getDateRange(filter as string, startDate as string, endDate as string);

    // Base query for date range
    const baseMatchQuery: Record<string, any> = {
      createdAt: { $gte: start, $lte: end },
    };

    // Add status filter if provided
    const matchQuery = { ...baseMatchQuery };
    if (status) matchQuery.status = status;

    // Fetch orders matching query
    const orders = await Order.find(matchQuery)
      .populate("table")
      .populate("items.product")
      .sort({ createdAt: -1 });

    // Aggregate summary
    const summaryAgg = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);

    const summary = summaryAgg[0] || { totalOrders: 0, totalSales: 0 };

    // Aggregate status breakdown
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

    // Organize orders by status
    const allData: Record<string, any[]> = {};
    orders.forEach((order) => {
      const key = order.status;
      if (!allData[key]) allData[key] = [];
      allData[key].push(order);
    });

    // Respond
    res.status(200).json({
      success: true,
      filter,
      range: { start, end },
      summary,
      statusBreakdown,
      orders,
      allData,
      message: orders.length === 0 ? "No orders found in this date range" : undefined,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
