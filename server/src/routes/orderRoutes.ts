import { Router } from "express";
import {
  createOrder,
  getOrders,
  getKdsOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
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

// Guard all order operations with auth
router.use(authMiddleware);

// POS & General Orders
router.post("/", checkPermission("create_order"), createOrder);
router.get("/", checkPermission("view_orders"), getOrders);
router.get("/kds", checkPermission(["view_kds", "view_orders"]), getKdsOrders);

// Reports & Summaries
router.get("/summary/today", getTodayOrderSummaryController);
router.get("/summary/report", checkPermission("view_reports"), getOrderReport);
router.get("/sales/last-7-days", checkPermission("view_reports"), getSalesLast7Days);

// Specific Order Management
router.get("/:id", checkPermission(["view_orders", "view_kds"]), getOrderById);
router.patch("/:id/status", checkPermission(["update_order_status", "edit_order"]), updateOrderStatus);
router.put("/:id", checkPermission(["edit_order", "update_order_status"]), updateOrder);
router.post("/:id/refund", checkPermission("refund_order"), refundOrder);
router.delete("/:id", checkPermission("cancel_order"), deleteOrder);

export default router;
