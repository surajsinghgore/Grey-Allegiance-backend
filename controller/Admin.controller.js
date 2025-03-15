import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import Admin from "../models/Admin.model.js";


// [POST] - Register Admin
export const registerAdmin = async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password, mobile, permission } = req.body;
        let admin = await Admin.findOne({ email });
        if (admin) return res.status(400).json({ message: "Admin already exists" });
        admin = new Admin({ name, email, password, mobile, permission });
        await admin.save();

        res.status(201).json({ message: "Admin registered successfully", admin });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



// [POST] - Login Admin
export const loginAdmin = async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        // Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        // Check if admin is active
        if (admin.status !== "active") {
            return res.status(403).json({ message: "Admin account is inactive" });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT token
        const token = jwt.sign({ id: admin._id, permission: admin.permission }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.status(200).json({ message: "Login successful", token, permission: admin.permission });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// [PATCH] - Change Admin Password
export const changeAdminPassword = async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, oldPassword, newPassword } = req.body;

        // Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        // Validate old password
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

        // Check if the new password is the same as the old password
        const isSamePassword = await bcrypt.compare(newPassword, admin.password);
        if (isSamePassword) return res.status(400).json({ message: "New password must be different from the old password" });

        // Assign new password (will be hashed by the schema pre-save hook)
        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

