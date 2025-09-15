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

const router = Router();

router.get("/superadmin", createSuperAdmin);

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/staff", getStaffs);
router.post("/staff", addStaff);
router.put("/staff/:id", updateStaff);
router.patch("/staff/:id/active", toggleStaffActive);
router.delete("/staff/:id", deleteStaff);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
export default router;
