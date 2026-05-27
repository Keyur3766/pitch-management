import { Router } from "express";
import { confirmBooking, getAllPitches, getMyBookings, getSlotsByPitchAndDate, reserverBooking } from "../controllers/booking.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.use(verifyJWT);
router.route("/reserve-slot").post(reserverBooking);
router.route("/confirm-booking").post(confirmBooking);
router.route("/pitches").get(getAllPitches);
router.route("/slots").get(getSlotsByPitchAndDate);
router.route(`/my-bookings`).get(getMyBookings);


export default router;