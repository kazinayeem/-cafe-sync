import { Order } from "../models/Order";

export const getTodayOrderSummary = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const summary = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // ✅ Define all possible statuses
  const allStatuses = ["pending", "preparing", "served", "cancelled"];

  // Convert aggregation result into a dictionary
  const statusCounts: Record<string, number> = {};
  allStatuses.forEach((status) => {
    statusCounts[status] = 0; // default 0
  });

  summary.forEach((s) => {
    statusCounts[s._id] = s.count;
  });

  return {
    totalOrders: summary.reduce((sum, s) => sum + s.count, 0),
    ...statusCounts,
  };
};
