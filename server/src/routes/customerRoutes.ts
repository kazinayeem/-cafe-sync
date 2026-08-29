import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  adjustLoyaltyPoints,
} from "../controllers/customer.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = Router();

router.use(authMiddleware);

router.get("/", checkPermission("manage_customers"), getCustomers);
router.get("/:id", checkPermission("manage_customers"), getCustomerById);
router.post("/", checkPermission("manage_customers"), createCustomer);
router.put("/:id", checkPermission("manage_customers"), updateCustomer);
router.delete("/:id", checkPermission("manage_customers"), deleteCustomer);
router.post("/:id/loyalty", checkPermission("manage_customers"), adjustLoyaltyPoints);

export default router;
