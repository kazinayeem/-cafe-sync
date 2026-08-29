import { Router } from "express";
import {
  getCurrentShift,
  openShift,
  logCashMovement,
  closeShift,
  getShiftHistory,
} from "../controllers/shift.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = Router();

router.use(authMiddleware);

router.get("/current", getCurrentShift);
router.post("/open", checkPermission("manage_shifts"), openShift);
router.post("/cash-movement", checkPermission("manage_shifts"), logCashMovement);
router.post("/close", checkPermission("manage_shifts"), closeShift);
router.get("/history", checkPermission("manage_shifts"), getShiftHistory);

export default router;
