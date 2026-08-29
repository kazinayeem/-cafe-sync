import express from "express";
import {
  getAllTables,
  createTable,
  updateTableStatus,
  getTableStats,
  deleteTable,
  updateTable,
  updateTableLayout,
  regenerateTableQr,
} from "../controllers/table.Controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

router.use(authMiddleware);

router.get("/", checkPermission("manage_tables"), getAllTables);
router.post("/", checkPermission("manage_tables"), createTable);
router.post("/:id/status", checkPermission("manage_tables"), updateTableStatus);
router.post("/:id/regenerate-qr", checkPermission("manage_tables"), regenerateTableQr);
router.put("/layout", checkPermission("manage_tables"), updateTableLayout);
router.put("/:id", checkPermission("manage_tables"), updateTable);
router.delete("/:id", checkPermission("manage_tables"), deleteTable);
router.get("/stats", getTableStats);

export default router;
