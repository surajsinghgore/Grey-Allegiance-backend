import express from "express";
import {
  registerAdmin,
  loginAdmin,
  changeAdminPassword,
  updateAdminRole,
  getCurrentAdminInfo,
  getAllAdminsApi,
  deleteAdminApi,
} from "../controller/Admin.controller.js";
import {
  adminRegisterValidation,
  adminLoginValidation,
  changePasswordValidation,
  updateAdminValidation,
} from "../validators/Admin.validator.js";
import { AdminVerifyMiddleware } from "../middlewares/AdminVerify.middleware.js";

const router = express.Router();

// Register Admin
router.post("/register", adminRegisterValidation, registerAdmin);

// Login Admin
router.post("/login", adminLoginValidation, loginAdmin);

// Change Password
router.patch("/change-password", changePasswordValidation, changeAdminPassword);

// change status
router.put("/update-role",  AdminVerifyMiddleware,updateAdminValidation, updateAdminRole);

router.get("/get-me", AdminVerifyMiddleware, getCurrentAdminInfo);

router.get("/get-all-admin", AdminVerifyMiddleware, getAllAdminsApi);
router.get("/delete-admin-api", AdminVerifyMiddleware, deleteAdminApi);
export default router;
