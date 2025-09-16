import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.Controller";

const router = express.Router();

// GET /api/settings
router.get("/", getSettings);

// PUT /api/settings
router.put("/", updateSettings);

export default router;
