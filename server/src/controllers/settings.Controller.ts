import { Request, Response } from "express";
import {
  BusinessSettingsDocument,
  defaultSettings,
  SettingModel,
} from "../models/Settings";

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SettingModel.findOne();
    if (!settings) {
      // if no settings exist, create default
      return res
        .status(404)
        .json({ success: false, message: "Settings not found" });
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ======================
// Update/Edit Settings
// ======================
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates: Partial<BusinessSettingsDocument> = req.body;

    // get the current settings (only one)
    let settings = await SettingModel.findOne();
    if (!settings) {
      settings = await SettingModel.create(defaultSettings);
    }

    // update only the provided fields
    Object.keys(updates).forEach((key) => {
      (settings as any)[key] = (updates as any)[key];
    });

    await settings.save();
    return res.status(200).json({ success: true, data: settings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
