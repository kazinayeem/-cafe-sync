import express from "express";
import {
  getPublicMenu,
  getTableByQrToken,
  createQrOrder,
  trackOrder,
  getDisplayOrders,
} from "../controllers/publicMenu.controller";

const router = express.Router();

// Public customer routes (No auth required)
router.get("/menu", getPublicMenu);
router.get("/tables/qr/:qrToken", getTableByQrToken);
router.get("/tables/qr/:storeId/:tableId", getTableByQrToken);
router.post("/orders/qr", createQrOrder);
router.get("/orders/track/:orderId", trackOrder);
router.get("/orders/display", getDisplayOrders);

export default router;
