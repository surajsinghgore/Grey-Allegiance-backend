import express from "express";
import { createBooking, getAllBookings, getAvailableSlots, updateBookingStatus } from "../controller/Booking.controller.js";
import { validateBooking } from "../validators/Booking.validator.js";
import { AdminVerifyMiddleware } from "../middlewares/AdminVerify.middleware.js";


const router = express.Router();


router.post("/create-booking", validateBooking,createBooking);
router.get("/available-slots", getAvailableSlots);
router.patch("/update-booking-status/:bookingId", AdminVerifyMiddleware,updateBookingStatus);
router.get("/bookings", getAllBookings);
export default router;
