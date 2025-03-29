import express from 'express';
import { createBlog, deleteBlogById, getAllBlogs, getAllBlogsAdmin, getBlogById, getBlogByIdAdmin, updateBlogById, uploadBlogThumbnailApi } from '../controller/Blog.controller.js';
import { blogValidator } from '../validators/Blog.validator.js';
import { AdminVerifyMiddleware } from '../middlewares/AdminVerify.middleware.js';
import { upload } from '../middlewares/mutlerMiddleware.js';
import { validationResult } from 'express-validator';
import multer from 'multer';

const router = express.Router();

router.post(
    "/create",
    AdminVerifyMiddleware,
    (req, res, next) => {
        upload.single("thumbnail")(req, res, (err) => {
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
                        message: "Only one thumbnail file is allowed.",
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
                    message: "Thumbnail is required. Please upload a valid image.",
                });
            }
            next();
        });
    },
    blogValidator,
    createBlog
);




router.patch(
    "/update-thumbnail",
    AdminVerifyMiddleware,
    (req, res, next) => {
        upload.single("thumbnail")(req, res, (err) => {
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
                        message: "Only one thumbnail file is allowed.",
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
                    message: "Thumbnail is required. Please upload a valid image.",
                });
            }

            const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
            if (!allowedMimeTypes.includes(req.file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid file format. Only JPG, PNG, GIF, and WEBP files are allowed.",
                });
            }

            next();
        });
    },
    uploadBlogThumbnailApi
);

router.get('/all', getAllBlogs);
router.get('/all/:id', getBlogById);
router.patch("/:id", AdminVerifyMiddleware, updateBlogById);

router.get('/all-admin', getAllBlogsAdmin);
router.get('/all-admin/:id', getBlogByIdAdmin);

router.delete('/:id', AdminVerifyMiddleware, deleteBlogById);
export default router;
