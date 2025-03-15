import { body } from "express-validator";

export const validateBooking = [
  body("serviceId")
    .notEmpty()
    .withMessage("Service ID is required")
    .isMongoId()
    .withMessage("Invalid Service ID"),

  body("bookingDate")
    .notEmpty()
    .withMessage("Booking date is required")
    .isISO8601()
    .withMessage("Invalid date format (Use YYYY-MM-DD)"),

  body("bookingTime")
    .notEmpty()
    .withMessage("Booking time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Invalid booking time format (Use HH:mm)"),

  body("bookedDuration")
    .notEmpty()
    .withMessage("Booked duration is required")
    .isInt({ min: 1 })
    .withMessage("Booked duration must be a positive integer"),

  body("name").notEmpty().withMessage("Name is required"),

  body("email").isEmail().withMessage("Valid email is required"),

  body("mobile")
    .notEmpty()
    .withMessage("Mobile number is required")
    .isMobilePhone()
    .withMessage("Invalid mobile number"),

  body("address").notEmpty().withMessage("Address is required"),

  body("city").notEmpty().withMessage("City is required"),

  body("pincode")
    .notEmpty()
    .withMessage("Pincode is required")
    .isPostalCode("any")
    .withMessage("Invalid pincode"),

  body("country").notEmpty().withMessage("Country is required"),
];
