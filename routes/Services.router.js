import express from "express";

import { AdminVerifyMiddleware } from "../middlewares/AdminVerify.middleware.js";
import { createServiceValidation } from "../validators/Service.validator.js";
import { createService, deleteServiceById, updateServiceById } from "../controller/Services.controller.js";



const router = express.Router();


router.post("/create", AdminVerifyMiddleware, createServiceValidation, createService);

router.put("/services/:id", AdminVerifyMiddleware, updateServiceById);
router.delete("/services/:id", AdminVerifyMiddleware, deleteServiceById);
export default router;
