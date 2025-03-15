import { body } from 'express-validator';


export const registerUserValidation = [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('mobile').isLength({ min: 10, max: 15 }).withMessage('Mobile number must be between 10 and 15 digits'),
    body('address').not().isEmpty().withMessage('Address is required'),
    body('pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits'),
    body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number.")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character.")
    .trim(),
];


export const loginUserValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'), 
    body('password').not().isEmpty().withMessage('Password is required'), 
];

export const changePasswordValidation = [
    body('currentPassword')
        .not().isEmpty().withMessage('Current password is required') 

    ,body('newPassword')
        .not().isEmpty().withMessage('New password is required')
        .isLength({ min: 5 }).withMessage('New password must be at least 5 characters long.') 
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.') 
        .matches(/[0-9]/).withMessage('Password must contain at least one number.')
        .matches(/[\W_]/).withMessage('Password must contain at least one special character.')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        })
];

export const validatePasswordReset = [
    body('resetToken')
        .notEmpty().withMessage('Reset token is required.')
        .isString().withMessage('Reset token must be a string.'),

    body('newPassword')
        .notEmpty().withMessage('New password is required.')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter.')
        .matches(/[0-9]/).withMessage('Password must contain at least one number.')
        .matches(/[\W_]/).withMessage('Password must contain at least one special character.')
        .trim(),
];

