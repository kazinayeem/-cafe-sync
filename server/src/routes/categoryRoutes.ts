import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.post("/", authMiddleware, checkPermission("manage_products"), createCategory);
router.put("/:id", authMiddleware, checkPermission("manage_products"), updateCategory);
router.delete("/:id", authMiddleware, checkPermission("manage_products"), deleteCategory);

export default router;
