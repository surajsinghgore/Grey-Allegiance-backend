import { body } from "express-validator";

export const validateRequestQuote = [
  body("firstName").notEmpty().withMessage("First name is required"),

  body("lastName").notEmpty().withMessage("Last name is required"),

  body("mobile")
    .notEmpty()
    .withMessage("Mobile number is required")
    .isMobilePhone()
    .withMessage("Invalid mobile number"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),

  body("location").notEmpty().withMessage("Location is required"),

  body("reasonOfInquiry").notEmpty().withMessage("Reason for inquiry is required"),

  body("message").notEmpty().withMessage("Message is required"),
];
