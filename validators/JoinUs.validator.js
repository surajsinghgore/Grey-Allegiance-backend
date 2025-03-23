import { body } from "express-validator";

export const validateJoinUs = [
  body("name").notEmpty().withMessage("Name is required"),

  body("email").notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Valid email is required"),

  body("mobile").notEmpty().withMessage("Mobile number is required")
    .isMobilePhone().withMessage("Invalid mobile number"),

  body("aboutYou").notEmpty().withMessage("About you is required"),

  body("whyJoinUs").notEmpty().withMessage("Reason for joining is required"),

 ];
