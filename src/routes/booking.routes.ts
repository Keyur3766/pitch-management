import { Router } from "express";
import { confirmBooking, reserverBooking } from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.use(verifyJWT);
router.route("/reserve-slot").post(reserverBooking);
router.route("/confirm-booking").post(confirmBooking);

export default router;