// validators/blogValidator.js
import { body } from 'express-validator';

export const blogValidator = [
    body('thumbnailUrl')
        .notEmpty().withMessage('Thumbnail URL is required')
        .isURL().withMessage('Invalid URL format'),
    
    body('title')
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 150 }).withMessage('Title should be less than 150 characters'),
    
    body('content')
        .notEmpty().withMessage('Content is required'),

    body('status')
        .optional()
        .isIn(['active', 'inactive']).withMessage('Status must be either "active" or "inactive"'),
];
