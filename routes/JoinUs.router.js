import express from "express";
import { validateJoinUs } from "../validators/JoinUs.validator.js";
import { createJoinUs, getAllJoinUsRequests, getPendingJoinUsRequests, updateJoinUsStatus } from "../controller/JoinUs.controller.js";
import { AdminVerifyMiddleware } from "../middlewares/AdminVerify.middleware.js";
import { validationResult } from "express-validator";
import { upload } from "../middlewares/mutlerMiddleware.js";
const router = express.Router();



router.post(
    "/apply",
    upload.single("resume"),
    validateJoinUs,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume is required. Please upload a resume.",
            });
        }

        const allowedMimeTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file format. Only PDF and DOCX files are allowed.",
            });
        }

        next();
    },
    createJoinUs
);



router.get("/pending", getPendingJoinUsRequests);
router.get("/all-joinUs", getAllJoinUsRequests);
router.patch("/:id", AdminVerifyMiddleware, updateJoinUsStatus);


export default router;
