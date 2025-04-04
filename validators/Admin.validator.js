import { body } from "express-validator";

// Admin Register Validation
export const adminRegisterValidation = [
  body("name").isLength({ min: 3 }).withMessage("Name must be at least 3 characters long.").trim().escape(),

  body("email")
    .isEmail()
    .withMessage("Must be a valid email address.")
    .matches(/@gmail\.com$/)
    .withMessage("Only Gmail accounts are allowed.")
    .normalizeEmail(),


  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number.")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character.")
    .trim(),

  body("permission")
    .isString()
    .withMessage("Permission must be a string.")
    .isIn(["all", "read"])
    .withMessage("Invalid permission. Allowed values: all, read."),
];

// Admin Login Validation
export const adminLoginValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// Change Password Validation
export const changePasswordValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long.")
    .matches(/[A-Z]/)
    .withMessage("New password must contain at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("New password must contain at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("New password must contain at least one number.")
    .matches(/[\W_]/)
    .withMessage("New password must contain at least one special character.")
    .trim(),
];


export const updateAdminValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Invalid status, please enter active or inactive status"),
  
  body("permission")
    .optional()
    .isIn(["all", "read"])
    .withMessage("Invalid permission,please enter all or read in permission"),
  
  body().custom((value) => {
    if (!value.status && !value.permission) {
      throw new Error("At least one field (status or permission) must be provided");
    }
    return true;
  }),
];