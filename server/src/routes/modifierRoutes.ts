import { Router } from "express";
import {
  getModifierGroups,
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
} from "../controllers/modifier.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = Router();

router.use(authMiddleware);

router.get("/", getModifierGroups);
router.post("/", checkPermission("manage_products"), createModifierGroup);
router.put("/:id", checkPermission("manage_products"), updateModifierGroup);
router.delete("/:id", checkPermission("manage_products"), deleteModifierGroup);

export default router;
