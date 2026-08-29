import { Router } from "express";
import {
  getReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
} from "../controllers/reservation.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import { checkPermission } from "../middleware/checkPermission";

const router = Router();

router.use(authMiddleware);

router.get("/", checkPermission("manage_reservations"), getReservations);
router.post("/", checkPermission("manage_reservations"), createReservation);
router.put("/:id/status", checkPermission("manage_reservations"), updateReservationStatus);
router.delete("/:id", checkPermission("manage_reservations"), deleteReservation);

export default router;
