import express from "express";
import { validateJoinUs } from "../validators/JoinUs.validator.js";
import { createJoinUs, getAllJoinUsRequests, getPendingJoinUsRequests, updateJoinUsStatus } from "../controller/JoinUs.controller.js";
import { AdminVerifyMiddleware } from "../middlewares/AdminVerify.middleware.js";
import { validationResult } from "express-validator";
import { upload } from "../middlewares/mutlerMiddleware.js";
import multer from "multer";
const router = express.Router();



router.post(
    "/apply",
    (req, res, next) => {
        upload.single("resume")(req, res, (err) => {
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({
                        success: false,
                        message: "File size exceeds 5MB. Please upload a smaller file.",
                    });
                }
                if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({
                        success: false,
                        message: "Only one resume file is allowed.",
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message || "Error uploading file.",
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Resume is required. Please upload a valid file.",
                });
            }

            const allowedMimeTypes = [
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid file format. Only PDF and DOCX files are allowed.",
                });
            }

            if (req.file.size > 5 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: "File size exceeds 5MB. Please upload a smaller file.",
                });
            }

            next();
        });
    },
    validateJoinUs,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array() });
        }
        next();
    },
    createJoinUs
);



router.get("/pending", getPendingJoinUsRequests);
router.get("/all-joinUs", getAllJoinUsRequests);
router.patch("/:id", AdminVerifyMiddleware, updateJoinUsStatus);


export default router;
