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

const router = Router();

router.post("/", upload.single("image"), createProduct);
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
