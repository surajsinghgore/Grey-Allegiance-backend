
import slugify from 'slugify';
import Blog from '../models/Blog.model.js';
import { uploadThumbnailToCloudinary } from '../utils/cloudinarySetup..js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPublicIdFromUrl } from '../utils/Halper.js';
import { v2 as cloudinary } from "cloudinary";


export const createBlog = async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to create a blog" });
        }

        const author = req.user._id;
        const { title, content, categories, tags, status } = req.body;

        if (!req.file || !title || !content) {
            return res.status(400).json({ message: "Thumbnail, title, and content are required" });
        }

        const existingBlog = await Blog.findOne({ title });

        if (existingBlog) {
            return res.status(400).json({ message: "A blog with this title already exists" });
        }

        const uploadResult = await uploadThumbnailToCloudinary(req.file);

        if (uploadResult.statusCode !== 200) {
            return res.status(500).json({ message: "Error uploading thumbnail", error: uploadResult.error });
        }

        const slug = slugify(title, { lower: true, strict: true });

        const newBlog = new Blog({
            thumbnailUrl: uploadResult.data.secure_url,
            title,
            content,
            categories,
            tags,
            author,
            status: status || "active",
            slug
        });

        await newBlog.save();

        res.status(201).json({
            message: "Blog created successfully",
            data: newBlog
        });
    } catch (error) {
        console.error("Error creating blog:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const getAllBlogs = async (req, res) => {
    try {
        // Fetch all blogs with 'active' status, sorted by publishDate in descending order, excluding 'author' and 'status' fields
        const blogs = await Blog.find({ status: 'active' }) // Filter blogs by 'active' status
            .sort({ publishDate: -1 }) // Sort by publishDate in descending order
            .select('-author -status'); // Exclude both 'author' and 'status' fields from the result

        res.status(200).json({
            message: "Blogs fetched successfully",
            data: blogs
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getBlogById = async (req, res) => {
    try {
        const blogId = req.params.id;

        // Find the blog by ID and exclude 'author' field
        const blog = await Blog.findById(blogId).select('-author');

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Increment the 'views' field by 1
        blog.views += 1;

        // Save the updated blog with incremented views count
        await blog.save();

        res.status(200).json({
            message: "Blog fetched successfully",
            data: blog
        });
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
export const getAllBlogsAdmin = async (req, res) => {
    try {
        // Fetch all blogs sorted by publishDate in descending order, including all statuses (active and inactive)
        const blogs = await Blog.find() // No filter for status, fetch all blogs
            .sort({ publishDate: -1 }) // Sort by publishDate in descending order
            .select('-author'); // Exclude 'author' field from the result

        res.status(200).json({
            message: "Blogs fetched successfully",
            data: blogs
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getBlogByIdAdmin = async (req, res) => {
    try {
        const blogId = req.params.id;

        // Find the blog by ID and exclude 'author' field
        const blog = await Blog.findById(blogId).select('-author');

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json({
            message: "Blog fetched successfully",
            data: blog
        });
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const updateBlogById = async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to update a blog" });
        }

        const blogId = req.params.id;
        const { thumbnailUrl, title, content, categories, tags, status } = req.body;

        // Find the blog by ID
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Check if the title is provided and if it's unique (excluding the current blog)
        if (title) {
            const existingBlog = await Blog.findOne({ title: title, _id: { $ne: blogId } });
            if (existingBlog) {
                return res.status(400).json({ message: "A blog with this title already exists" });
            }

            // Update the title and slug if the title is provided
            blog.title = title;
            blog.slug = slugify(title, { lower: true, strict: true });
        }

        // Update other fields if provided
        if (thumbnailUrl) blog.thumbnailUrl = thumbnailUrl;
        if (content) blog.content = content;
        if (categories) blog.categories = categories;
        if (tags) blog.tags = tags;
        if (status) blog.status = status;

        // Save the updated blog
        const updatedBlog = await blog.save();

        res.status(200).json({
            message: "Blog updated successfully",
            data: updatedBlog,
        });
    } catch (error) {
        console.error("Error updating blog:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const deleteBlogById = async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to delete a blog" });
        }
        const blogId = req.params.id;

        // Find the blog by ID and delete it
        const blog = await Blog.findByIdAndDelete(blogId);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        res.status(200).json({
            message: "Blog deleted successfully",
            data: blog
        });
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const uploadBlogThumbnailApi = asyncHandler(async (req, res) => {
    try {
        if (req.user?.permission !== "all") {
            return res.status(403).json({ message: "You do not have permission to create a service" });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a blog thumbnail image.",
            });
        }

        const { blogId } = req.query;

        // ✅ Validate blog ID
        if (!blogId) {
            return res.status(400).json({
                success: false,
                message: "Blog ID is required to update the thumbnail.",
            });
        }

        // ✅ Find the blog
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found.",
            });
        }

        // ✅ Delete old thumbnail if exists
        if (blog.thumbnailUrl) {
            const publicId = getPublicIdFromUrl(blog.thumbnailUrl);
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }

        // ✅ Upload new thumbnail (buffer-based)
        const uploadResponse = await uploadThumbnailToCloudinary(req.file);

        if (uploadResponse.statusCode !== 200) {
            return res.status(uploadResponse.statusCode).json({
                success: false,
                message: uploadResponse.message,
                error: uploadResponse.error,
            });
        }

        // ✅ Save the new thumbnail URL
        blog.thumbnailUrl = uploadResponse.data.secure_url;
        await blog.save();

        return res.status(200).json({
            success: true,
            message: "Blog thumbnail updated successfully.",
            thumbnailUrl: uploadResponse.data.secure_url,
        });
    } catch (error) {
        console.error("Error uploading blog thumbnail: ", error);

        return res.status(500).json({
            success: false,
            message: "Error in uploading blog thumbnail.",
            error: error.message,
        });
    }
});
