import express from 'express';
import { createBlog, deleteBlogById, getAllBlogs, getAllBlogsAdmin, getBlogById, getBlogByIdAdmin, updateBlogById } from '../controller/Blog.controller.js';
import { blogValidator } from '../validators/Blog.validator.js';
import { AdminVerifyMiddleware } from '../middlewares/AdminVerify.middleware.js';
import { upload } from '../middlewares/mutlerMiddleware.js';
import { validationResult } from 'express-validator';

const router = express.Router();

router.post(
    "/create",
    AdminVerifyMiddleware,
    upload.single("thumbnail"), 
    blogValidator,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array() });
        }
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array() });
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
    },
    createBlog
);



router.get('/all', getAllBlogs);
router.get('/all/:id', getBlogById);
router.patch("/:id", AdminVerifyMiddleware, updateBlogById);

router.get('/all-admin', getAllBlogsAdmin);
router.get('/all-admin/:id', getBlogByIdAdmin);

router.delete('/:id', AdminVerifyMiddleware, deleteBlogById);
export default router;
