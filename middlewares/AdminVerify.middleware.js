import jwt from "jsonwebtoken";
import Admin from "../models/Admin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware to verify admin's JWT token and check permissions
export const AdminVerifyMiddleware = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookies or authorization header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ status: false, message: "Unauthorized request: No token provided" });
    }

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Find the admin using the ID from the token
    const admin = await Admin.findById(decodedToken?.id).select("_id email mobile permission name status");

    if (!admin) {
      return res.status(401).json({ status: false, message: "Unauthorized request: Admin not found" });
    }

    if (admin.status !== "active") {
      return res.status(403).json({ status: false, message: "Admin account is inactive" });
    }

    if (!admin.permission || !["all", "read"].includes(admin.permission)) {
      return res.status(403).json({ status: false, message: "Forbidden: Insufficient permissions" });
    }

    req.user = { ...admin.toObject(), permission: admin.permission };

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
