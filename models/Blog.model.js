import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    thumbnailUrl: {
        type: String,
        required: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    publishDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    content: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    likes: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: Number,
        default: 0,
    },
    categories: [{
        type: String,
    }],
    tags: [{
        type: String,
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
}, {
    timestamps: true,
});



// Create Blog model
const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
