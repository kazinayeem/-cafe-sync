import { Request, Response } from "express";
import {
  BusinessSettingsDocument,
  defaultSettings,
  SettingModel,
} from "../models/Settings";
import { AuthRequest } from "../middleware/authMiddleware";

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SettingModel.findOne();
    if (!settings) {
      settings = await SettingModel.create(defaultSettings);
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const updates: Partial<BusinessSettingsDocument> = req.body;

    let settings = await SettingModel.findOne();
    if (!settings) {
      settings = await SettingModel.create(defaultSettings);
    }

    Object.keys(updates).forEach((key) => {
      (settings as any)[key] = (updates as any)[key];
    });

    settings.updatedAt = new Date();
    await settings.save();
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
