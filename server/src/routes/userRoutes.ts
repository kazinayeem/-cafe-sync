import { Router } from "express";
import {
  createSuperAdmin,
  loginUser,
  registerUser,
  addStaff,
  getStaffs,
  updateStaff,
  toggleStaffActive,
  deleteStaff,
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = Router();

router.get("/superadmin", createSuperAdmin);

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// Staff management
router.get("/staff", authMiddleware, checkPermission("manage_staff"), getStaffs);
router.post("/staff", authMiddleware, checkPermission("manage_staff"), addStaff);
router.put("/staff/:id", authMiddleware, checkPermission("manage_staff"), updateStaff);
router.patch("/staff/:id/active", authMiddleware, checkPermission("manage_staff"), toggleStaffActive);
router.delete("/staff/:id", authMiddleware, checkPermission("manage_staff"), deleteStaff);

// Self profile
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

export default router;
