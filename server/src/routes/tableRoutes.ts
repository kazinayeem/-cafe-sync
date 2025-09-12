import express from "express";
import {
  getAllTables,
  createTable,
  updateTableStatus,
  getTableStats,
  deleteTable,
  updateTable,
} from "../controllers/tableController";

const router = express.Router();

// Get all tables
router.get("/", getAllTables);

// Create a table
router.post("/", createTable);

// Update table status (occupied/free)
router.post("/:id/status", updateTableStatus);

router.put("/:id", updateTable);

// Delete table
router.delete("/:id", deleteTable);

// Get table stats (total & available)
router.get("/stats", getTableStats);

export default router;
