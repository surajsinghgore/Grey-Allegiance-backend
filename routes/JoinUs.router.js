import express from "express";
import { validateJoinUs } from "../validators/JoinUs.validator.js";
import { createJoinUs, getAllJoinUsRequests, getPendingJoinUsRequests, updateJoinUsStatus } from "../controller/JoinUs.controller.js";
import { AdminVerifyMiddleware } from "../middlewares/AdminVerify.middleware.js";

const router = express.Router();

router.post("/apply",validateJoinUs, createJoinUs);
router.get("/pending", getPendingJoinUsRequests);
router.get("/all-joinUs", getAllJoinUsRequests);
router.patch("/:id", AdminVerifyMiddleware,updateJoinUsStatus);


export default router;
