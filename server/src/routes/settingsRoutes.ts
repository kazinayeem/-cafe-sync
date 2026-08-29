import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settings.Controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

router.get("/", getSettings);
router.put("/", authMiddleware, checkPermission("manage_settings"), updateSettings);

export default router;
