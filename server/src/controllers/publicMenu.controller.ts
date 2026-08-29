import { Request, Response } from "express";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { SettingModel, defaultSettings } from "../models/Settings";

export const getPublicMenu = async (req: Request, res: Response) => {
  try {
    const settings = (await SettingModel.findOne()) || defaultSettings;
    const categories = await Category.find().sort({ name: 1 });
    const products = await Product.find({ available: true })
      .populate("category", "name")
      .populate("modifierGroups")
      .sort({ name: 1 });

    return res.json({
      success: true,
      data: {
        business: {
          name: settings.businessName,
          address: settings.address,
          phone: settings.phone,
          website: settings.website,
          currency: settings.currency,
          openingTime: settings.openingTime,
          closingTime: settings.closingTime,
          offDays: settings.offDays,
        },
        categories,
        products,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
