import express from "express";
import {
  registerAdmin,
  loginAdmin,
  changeAdminPassword,
} from "../controller/Admin.controller.js";
import {
  adminRegisterValidation,
  adminLoginValidation,
  changePasswordValidation,
} from "../validators/Admin.validator.js";

const router = express.Router();

// Register Admin
router.post("/register", adminRegisterValidation, registerAdmin);

// Login Admin
router.post("/login", adminLoginValidation, loginAdmin);

// Change Password
router.patch("/change-password", changePasswordValidation, changeAdminPassword);

export default router;
