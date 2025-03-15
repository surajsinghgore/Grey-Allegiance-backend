import express from "express";

import { AdminVerifyMiddleware } from "../middlewares/AdminVerify.middleware.js";
import { createServiceValidation } from "../validators/Service.validator.js";
import { createService } from "../controller/Services.controller.js";



const router = express.Router();


router.post("/create",  AdminVerifyMiddleware,createServiceValidation, createService);



export default router;
