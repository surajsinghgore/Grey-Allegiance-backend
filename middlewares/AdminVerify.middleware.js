import jwt from "jsonwebtoken";
import Admin from "../models/Admin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const AdminVerifyMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ status: false, message: "Unauthorized request: No token provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role !== "admin") {
      return res.status(401).json({ status: false, message: "Unauthorized request: Admin access is required to access this request." });
    }
    const user = await Admin.findById(decodedToken?.id).select("_id email mobile permission name isVerified tokenVersion");

    if (!user) {
      return res.status(401).json({ status: false, message: "Unauthorized request: Admin not found" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ status: false, message: "Please verify your admin account" });
    }

    if (decodedToken.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized request: Token is invalid due to a new login session",
      });
    }

    // Add role 'admin' to req.user
    req.user = { ...user.toObject(), role: decodedToken.role };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ status: false, message: "Token has expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ status: false, message: "Invalid access token" });
    }
    return res.status(401).json({ status: false, message: error.message || "Unauthorized request" });
  }
});