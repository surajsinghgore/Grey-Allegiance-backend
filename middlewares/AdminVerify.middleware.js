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

    const admin = await Admin.findById(decodedToken?.id).select("_id email mobile permission name isVerified tokenVersion");

    if (!admin) {
      return res.status(401).json({ status: false, message: "Unauthorized request: Admin not found" });
    }

  
    if (decodedToken.tokenVersion !== admin.tokenVersion) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized request: Token is invalid due to a new login session",
      });
    }

    // Check if the admin has permission to proceed
    if (!admin.permission || !["all", "read"].includes(admin.permission)) {
      return res.status(403).json({ status: false, message: "Forbidden: Insufficient permissions" });
    }

    // Attach the admin details to `req.user`
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
