import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { SettingModel, defaultSettings } from "../models/Settings";

export const checkPermission = (required: string | string[]) => {
  const permissions = Array.isArray(required) ? required : [required];

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
      const userDirectPerms: string[] = req.userDetails?.permissions || [];
      if (permissions.some((p) => userDirectPerms.includes(p))) {
        return next();
      }

      // Otherwise check role permissions from Settings
      const settings = (await SettingModel.findOne()) || defaultSettings;
      const rolePerms: string[] =
        settings.permissions?.[req.user.role] ||
        defaultSettings.permissions?.[req.user.role] ||
        [];

      if (permissions.some((p) => rolePerms.includes(p))) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission [${permissions.join(" or ")}]`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error verifying permissions",
      });
    }
  };
};
