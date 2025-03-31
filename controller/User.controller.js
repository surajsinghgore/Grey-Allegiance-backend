
import { validationResult } from 'express-validator';
import User from '../models/User.model.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Booking from "../models/Booking.model.js";
import JoinUs from "../models/JoinUs.model.js";
import RequestQuote from "../models/RequestQuote.model.js";
import { generateForgotPasswordEmail } from '../utils/EmailTemplate/UserTemplate.js';
import { sendEmail } from '../handlers/SendEmail.js';
import Service from "../models/Services.model.js";


export const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, mobile, address, pincode, password } = req.body;

        const existingUserEmail = await User.findOne({ email });
        if (existingUserEmail) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const existingUserMobile = await User.findOne({ mobile });
        if (existingUserMobile) {
            return res.status(400).json({ message: "Mobile number already in use" });
        }

        // Create a new User instance
        const newUser = new User({
            name,
            email,
            mobile,
            address,
            pincode,
            password,
        });


        await newUser.save();


        res.status(201).json({
            message: "User registered successfully",
            data: {
                name: newUser.name,
                email: newUser.email,
                mobile: newUser.mobile,
                address: newUser.address,
                pincode: newUser.pincode,
            },
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists with the given email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Account not found" }); // Account not found
        }

        // Check if the user's status is true
        if (user.status !== true) {
            return res.status(403).json({ message: "Account is not active" }); // If account is not active
        }

        // Check if the password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" }); // Incorrect password
        }

        // Create and sign JWT token (valid for 1 hour)
        const token = jwt.sign(
            { userId: user._id, email: user.email }, // Payload with user data
            process.env.JWT_SECRET, // Secret key for signing the token
            { expiresIn: '1h' } // Token expiry time
        );

        // Return the response with the token and user details (excluding password)
        res.status(200).json({
            message: "Login successful",
            data: {
                token,
                user: {
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    address: user.address,
                    pincode: user.pincode,
                }
            }
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the current password matches the one stored in the database
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password" });
        }

        // Check if the new password is the same as the old one
        if (currentPassword === newPassword) {
            return res.status(400).json({ message: "New password cannot be the same as the current password" });
        }

        // Check if the new password is the same as the old password
        const isNewPasswordUnique = await user.comparePassword(newPassword);
        if (isNewPasswordUnique) {
            return res.status(400).json({ message: "New password cannot be the same as the old password" });
        }

        // Update the user's password in the database (bcrypt will handle hashing)
        user.password = newPassword;  // No need to hash the password here, it's handled by pre-save middleware
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const getCurrentUserActivity = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming req.user contains authenticated user details

        // Fetch the user's bookings
        const bookings = await Booking.find({ email: req.user.email }).sort({ createdAt: -1 });

        // Fetch the user's join requests
        const joinRequests = await JoinUs.find({ email: req.user.email }).sort({ createdAt: -1 });

        // Fetch the user's quote requests
        const quoteRequests = await RequestQuote.find({ email: req.user.email }).sort({ createdAt: -1 });

        // Fetch the user's service details
        const service = await Service.findOne({ userId: userId });

        // Return the response with all user activities and service details
        res.status(200).json({
            message: "User activity fetched successfully",
            data: {
                bookings,
                joinRequests,
                quoteRequests,
                service, // Adding service details to the response
            }
        });
    } catch (error) {
        console.error("Error fetching user activity:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


export const getCurrentActiveUserData = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming the user's data is in req.user after successful authentication

        // Fetch only the required fields for the current active user
        const user = await User.findById(userId).select('name email mobile address pincode status createdAt updatedAt');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the data in the response
        res.status(200).json({
            message: "Current active user data fetched successfully",
            data: user
        });
    } catch (error) {
        console.error("Error fetching active user data:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        console.log(resetToken)
        const emailContent = generateForgotPasswordEmail(resetToken);

        // Send the email with the reset password link
        await sendEmail(user.email, "Password Reset Request", emailContent);

        // Return success response
        res.status(200).json({
            message: "Password reset link has been sent to your email address.",
        });
    } catch (error) {
        console.error("Error during password reset:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const validateResetToken = async (req, res) => {
    const { resetToken, newPassword } = req.body;


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const { userId } = decoded;


        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if token has expired
        const tokenExpirationTime = decoded.exp * 1000;
        const currentTime = Date.now();

        if (currentTime > tokenExpirationTime) {
            return res.status(400).json({ message: 'Reset token has expired' });
        }

        // Check if new password is the same as the old one
        const isMatch = await bcrypt.compare(newPassword, user.password);
        if (isMatch) {
            return res.status(400).json({ message: 'New password cannot be the same as the old password' });
        }

        user.password = newPassword;


        await user.save();


        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error during password reset:', error.message);
        return res.status(500).json({ message: 'Server error during password reset' });
    }
};