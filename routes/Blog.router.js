import express from 'express';
import { createBlog, deleteBlogById, getAllBlogs, getAllBlogsAdmin, getBlogById, getBlogByIdAdmin, updateBlogById } from '../controller/Blog.controller.js'; 
import { blogValidator } from '../validators/Blog.validator.js';
import { AdminVerifyMiddleware } from '../middlewares/AdminVerify.middleware.js';

const router = express.Router();

router.post('/create', AdminVerifyMiddleware,blogValidator,createBlog);
router.get('/all',getAllBlogs);
router.get('/all/:id',getBlogById);
router.patch("/:id", AdminVerifyMiddleware,updateBlogById);

router.get('/all-admin',getAllBlogsAdmin);
router.get('/all-admin/:id',getBlogByIdAdmin);

router.delete('/:id', AdminVerifyMiddleware,deleteBlogById);
export default router;
