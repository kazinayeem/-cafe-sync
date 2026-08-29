import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  refundOrder,
  getTodayOrderSummaryController,
} from "../controllers/order.Controller";
import {
  getSalesLast7Days,
  getOrderReport,
} from "../controllers/orderReport.Controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = Router();

// Public summary for quick status check if needed or guarded with auth
router.use(authMiddleware);

router.post("/", checkPermission("create_order"), createOrder);
router.get("/", checkPermission("view_orders"), getOrders);
router.get("/summary/today", getTodayOrderSummaryController);
router.get("/summary/report", checkPermission("view_reports"), getOrderReport);
router.get("/sales/last-7-days", checkPermission("view_reports"), getSalesLast7Days);

router.get("/:id", checkPermission("view_orders"), getOrderById);
router.put("/:id", checkPermission("edit_order"), updateOrder);
router.post("/:id/refund", checkPermission("refund_order"), refundOrder);
router.delete("/:id", checkPermission("cancel_order"), deleteOrder);

export default router;
