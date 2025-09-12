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
} from "../controllers/User";

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

export default router;
