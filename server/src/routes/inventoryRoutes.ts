import { Router } from "express";
import {
  getInventory,
  adjustStock,
  getInventoryHistory,
} from "../controllers/inventory.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = Router();

router.use(authMiddleware);

router.get("/", checkPermission("manage_inventory"), getInventory);
router.post("/adjust", checkPermission("manage_inventory"), adjustStock);
router.get("/history", checkPermission("manage_inventory"), getInventoryHistory);

export default router;
