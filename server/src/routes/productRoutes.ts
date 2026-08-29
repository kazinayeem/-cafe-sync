import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  getProductsByCategory,
  searchProducts,
  updateProduct,
} from "../controllers/product.controller";
import { upload } from "../config/multer";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = Router();

router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

router.post("/", authMiddleware, checkPermission("manage_products"), upload.single("image"), createProduct);
router.put("/:id", authMiddleware, checkPermission("manage_products"), upload.single("image"), updateProduct);
router.delete("/:id", authMiddleware, checkPermission("manage_products"), deleteProduct);

export default router;
