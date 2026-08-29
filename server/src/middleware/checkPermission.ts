import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { SettingModel, defaultSettings } from "../models/Settings";

export const checkPermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Admin has blanket permissions
      if (req.user.role === "admin") {
        return next();
      }

      // Check user-specific permissions first
      if (
        req.userDetails?.permissions &&
        req.userDetails.permissions.includes(permission)
      ) {
        return next();
      }

      // Otherwise check role permissions from Settings
      const settings = (await SettingModel.findOne()) || defaultSettings;
      const rolePerms =
        settings.permissions?.[req.user.role] ||
        defaultSettings.permissions?.[req.user.role] ||
        [];

      if (rolePerms.includes(permission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission [${permission}]`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error verifying permissions",
      });
    }
  };
};
