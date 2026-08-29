import { Router } from "express";
import { getPublicMenu } from "../controllers/publicMenu.controller";

const router = Router();

// Public endpoint for customer-facing QR menu
router.get("/menu", getPublicMenu);

export default router;
