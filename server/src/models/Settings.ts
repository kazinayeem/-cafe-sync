import { Schema, model, Document } from "mongoose";

// ======================
// 1️⃣ Pure TypeScript Interface (plain object type)
// ======================
export interface IBusinessSettings {
  // 🧾 Finance
  taxRate: number;
  discountRate: number;
  currency: string;
  serviceCharge?: number;

  // 🏢 Business Info
  businessName: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;

  // 🖨️ Printing
  receiptFooter?: string;
  logoUrl?: string;
  showTableName?: boolean;

  // ⚙️ POS Behavior
  enableDiscountInput: boolean;
  enableTaxOverride: boolean;
  allowNegativeStock: boolean;

  // 🕒 Shifts & Timing
  openingTime?: string; // e.g. "09:00"
  closingTime?: string; // e.g. "23:00"
  offDays?: string[]; // e.g. ["Friday"]

  // 📊 Reports
  lowStockAlertLevel?: number;
  salesTarget?: number;

  updatedAt?: Date;
}

// ======================
// 2️⃣ Mongoose Interface (extends Document)
// ======================
export interface BusinessSettingsDocument extends IBusinessSettings, Document {}

// ======================
// 3️⃣ Mongoose Schema
// ======================
const settingSchema = new Schema<BusinessSettingsDocument>(
  {
    // 🧾 Finance
    taxRate: { type: Number, required: true, default: 0 },
    discountRate: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "BDT" },
    serviceCharge: { type: Number, default: 0 },

    // 🏢 Business Info
    businessName: { type: String, required: true, default: "Cafe Sync" },
    address: { type: String, required: true, default: "Mirpur, Dhaka - 1206" },
    phone: { type: String, required: true, default: "012-345-6789" },
    email: { type: String },
    website: { type: String },

    // 🖨️ Printing
    receiptFooter: {
      type: String,
      default: "nayeemsoft - made by www.kazinayee.site",
    },
    logoUrl: { type: String },
    showTableName: { type: Boolean, default: true },

    // ⚙️ POS Behavior
    enableDiscountInput: { type: Boolean, default: true },
    enableTaxOverride: { type: Boolean, default: false },
    allowNegativeStock: { type: Boolean, default: false },

    // 🕒 Shifts & Timing
    openingTime: { type: String, default: "09:00" },
    closingTime: { type: String, default: "23:00" },
    offDays: { type: [String], default: ["Friday"] },

    // 📊 Reports
    lowStockAlertLevel: { type: Number, default: 5 },
    salesTarget: { type: Number, default: 10000 },
  },
  { timestamps: true }
);

// ======================
// 4️⃣ Mongoose Model
// ======================
export const SettingModel = model<BusinessSettingsDocument>(
  "Setting",
  settingSchema
);

// ======================
// 5️⃣ Default Settings (plain object)
// ======================
export const defaultSettings: IBusinessSettings = {
  taxRate: 5,
  discountRate: 0,
  currency: "BDT",
  serviceCharge: 0,

  businessName: "Cafe Sync",
  address: "Mirpur, Dhaka - 1206",
  phone: "012-345-6789",
  website: "https://www.kazinayee.site",
  receiptFooter: "nayeemsoft - made by www.kazinayee.site",

  enableDiscountInput: true,
  enableTaxOverride: false,
  allowNegativeStock: false,

  openingTime: "09:00",
  closingTime: "23:00",
  offDays: ["Friday"],

  lowStockAlertLevel: 5,
  salesTarget: 10000,
  updatedAt: new Date(),
};
