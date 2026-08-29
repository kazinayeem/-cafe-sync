import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

export interface JwtPayload {
  id: string;
  role: string;
  email?: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
  userDetails?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No authentication token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secretkey"
    ) as JwtPayload;

    req.user = decoded;

    // Optionally attach active user document
    const userDoc = await User.findById(decoded.id).select("-passwordHash");
    if (!userDoc || !userDoc.active) {
      return res.status(401).json({ success: false, message: "User account inactive or not found" });
    }
    req.userDetails = userDoc;

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to access this resource",
      });
    }
    next();
  };
};
