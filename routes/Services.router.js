import express from "express";

import { AdminVerifyMiddleware } from "../middlewares/AdminVerify.middleware.js";
import { createServiceValidation } from "../validators/Service.validator.js";
import { createService, deleteServiceById, getAllServices, getServiceById, updateServiceById } from "../controller/Services.controller.js";
import { upload } from "../middlewares/mutlerMiddleware.js";
import { validationResult } from "express-validator";
import multer from "multer";



const router = express.Router();

router.post(
    "/create",
    AdminVerifyMiddleware,
    (req, res, next) => {
        upload.single("image")(req, res, (err) => {
            if (err) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ success: false, message: "File size exceeds 5MB. Please upload a smaller image." });
                }
                if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({ success: false, message: "Only one image file is allowed." });
                }
                return res.status(400).json({ success: false, message: err.message || "Error uploading file." });
            }

            if (!req.file) {
                return res.status(400).json({ success: false, message: "Service Image is required. Please upload a valid image." });
            }

            const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).json({ success: false, message: "Invalid file format. Only JPG, PNG, GIF, and WEBP files are allowed." });
            }

            next();
        });
    },
    createServiceValidation,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array() });
        }
        next();
    },
    createService
);

router.put("/services/:id", AdminVerifyMiddleware, updateServiceById);
router.delete("/services/:id", AdminVerifyMiddleware, deleteServiceById);
router.get("/services", getAllServices);
router.get("/services/:id", getServiceById);



export default router;
