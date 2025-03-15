import express from 'express';
import { changePassword, getCurrentActiveUserData, getCurrentUserActivity, loginUser, registerUser } from '../controller/User.controller.js';
import { changePasswordValidation, loginUserValidation, registerUserValidation } from '../validators/User.validator.js';
import { UserVerifyMiddleware } from '../middlewares/UserVerify.middleware.js';

const router = express.Router();

router.post('/register', registerUserValidation, registerUser);
router.post('/login', loginUserValidation, loginUser);
router.patch('/change-password', UserVerifyMiddleware, changePasswordValidation,changePassword)

router.get("/user-activity", UserVerifyMiddleware, getCurrentUserActivity);
router.get("/get-me", UserVerifyMiddleware, getCurrentActiveUserData);

export default router;
