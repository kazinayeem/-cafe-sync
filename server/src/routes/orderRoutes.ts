// routes/orderRoutes.ts
import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/order.Controller";

const router = Router();

// @route   POST /api/orders
// @desc    Create a new order
router.post("/", createOrder);

// @route   GET /api/orders
// @desc    Get all orders
router.get("/", getOrders);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
router.get("/:id", getOrderById);

// @route   PUT /api/orders/:id
// @desc    Update order (status/paymentMethod)
router.put("/:id", updateOrder);

// @route   DELETE /api/orders/:id
// @desc    Delete order
router.delete("/:id", deleteOrder);

export default router;
