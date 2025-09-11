import { Router } from "express";
import { createSuperAdmin, loginUser, registerUser } from "../controllers/User";

const router = Router();

// Run once to create super admin
router.get("/superadmin", createSuperAdmin);

// Register & Login
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
