import express from 'express';
import { changePassword, forgotPassword, getCurrentActiveUserData, getCurrentUserActivity, loginUser, registerUser, validateResetToken } from '../controller/User.controller.js';
import { changePasswordValidation, loginUserValidation, registerUserValidation, validatePasswordReset } from '../validators/User.validator.js';
import { UserVerifyMiddleware } from '../middlewares/UserVerify.middleware.js';

const router = express.Router();

router.post('/register', registerUserValidation, registerUser);
router.post('/login', loginUserValidation, loginUser);
router.patch('/change-password', UserVerifyMiddleware, changePasswordValidation,changePassword)

router.get("/user-activity", UserVerifyMiddleware, getCurrentUserActivity);
router.get("/get-me", UserVerifyMiddleware, getCurrentActiveUserData);
router.post("/forgot-password", forgotPassword);
router.patch('/reset-password',validatePasswordReset,validateResetToken);
export default router;
