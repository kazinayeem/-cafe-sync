import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { ActivityLog } from "../models/ActivityLog";

export const getActivityLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50, category } = req.query;
    const query: any = {};
    if (category && category !== "all") query.category = category;

    const logs = await ActivityLog.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({ success: true, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
