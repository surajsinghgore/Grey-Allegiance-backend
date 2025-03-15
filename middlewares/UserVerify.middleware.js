import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const UserVerifyMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ status: false, message: "Unauthorized: No token provided" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
   

    const user = await User.findById(decodedToken.userId).select("_id email mobile name status");

    if (!user) {
      return res.status(401).json({ status: false, message: "User not found" });
    }

    // Check if the user account is active
    if (!user.status) {
      return res.status(401).json({ status: false, message: "Account is inactive" });
    }

    req.user = user; 

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ status: false, message: "Token expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ status: false, message: "Invalid token" });
    }
    return res.status(401).json({ status: false, message: error.message || "Unauthorized" });
  }
};
