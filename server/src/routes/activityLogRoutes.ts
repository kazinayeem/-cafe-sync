import { Router } from "express";
import { getActivityLogs } from "../controllers/activityLog.controller";
import { authMiddleware, requireRole } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);
router.get("/", requireRole(["admin", "manager"]), getActivityLogs);

export default router;
