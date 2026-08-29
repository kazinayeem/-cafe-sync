import { Schema, model, Document } from "mongoose";

export interface IBusinessSettings {
  // 🧾 Finance & Tax
  taxRate: number;
  discountRate: number;
  currency: string;
  serviceCharge: number;

  // 🏢 Business Info
  businessName: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;

  // 🖨️ Printing & Receipt
  receiptFooter?: string;
  logoUrl?: string;
  showTableName?: boolean;

  // ⚙️ POS Behavior
  enableDiscountInput: boolean;
  enableTaxOverride: boolean;
  allowNegativeStock: boolean;

  // 🎁 Loyalty Program
  enableLoyalty: boolean;
  loyaltyEarnRate: number; // e.g., 1 point per 100 spent
  loyaltyRedeemRate: number; // e.g., 1 currency per 10 points

  // 🕒 Shifts & Timing
  openingTime: string;
  closingTime: string;
  offDays: string[];

  // 📊 Reports & Thresholds
  lowStockAlertLevel: number;
  salesTarget: number;

  // 🔐 Permissions
  permissions?: Record<string, string[]>;

  updatedAt?: Date;
}

export interface BusinessSettingsDocument extends IBusinessSettings, Document {}

const settingSchema = new Schema<BusinessSettingsDocument>(
  {
    // 🧾 Finance
    taxRate: { type: Number, required: true, default: 5 },
    discountRate: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "BDT" },
    serviceCharge: { type: Number, default: 0 },

    // 🏢 Business Info
    businessName: { type: String, required: true, default: "BornoCafe" },
    address: { type: String, required: true, default: "Mirpur, Dhaka - 1206" },
    phone: { type: String, required: true, default: "012-345-6789" },
    email: { type: String, default: "contact@bornocafe.com" },
    website: { type: String, default: "https://bornocafe.vercel.app" },

    // 🖨️ Printing
    receiptFooter: {
      type: String,
      default: "Thank you for visiting BornoCafe! Please come again.",
    },
    logoUrl: { type: String },
    showTableName: { type: Boolean, default: true },

    // ⚙️ POS Behavior
    enableDiscountInput: { type: Boolean, default: true },
    enableTaxOverride: { type: Boolean, default: false },
    allowNegativeStock: { type: Boolean, default: false },

    // 🎁 Loyalty
    enableLoyalty: { type: Boolean, default: true },
    loyaltyEarnRate: { type: Number, default: 1 }, // 1 pt per 10 currency
    loyaltyRedeemRate: { type: Number, default: 0.5 }, // 1 pt = 0.5 currency

    // 🕒 Shifts & Timing
    openingTime: { type: String, default: "09:00" },
    closingTime: { type: String, default: "23:00" },
    offDays: { type: [String], default: [] },

    // 📊 Reports
    lowStockAlertLevel: { type: Number, default: 10 },
    salesTarget: { type: Number, default: 15000 },

    // 🔐 Role Permissions
    permissions: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const SettingModel = model<BusinessSettingsDocument>(
  "Setting",
  settingSchema
);

export const defaultSettings: IBusinessSettings = {
  taxRate: 5,
  discountRate: 0,
  currency: "BDT",
  serviceCharge: 0,
  businessName: "BornoCafe",
  address: "Mirpur, Dhaka - 1206",
  phone: "012-345-6789",
  email: "contact@bornocafe.com",
  website: "https://bornocafe.vercel.app",
  receiptFooter: "Thank you for visiting BornoCafe! Please come again.",
  enableDiscountInput: true,
  enableTaxOverride: false,
  allowNegativeStock: false,
  enableLoyalty: true,
  loyaltyEarnRate: 1,
  loyaltyRedeemRate: 0.5,
  openingTime: "09:00",
  closingTime: "23:00",
  offDays: [],
  lowStockAlertLevel: 10,
  salesTarget: 15000,
  permissions: {
    admin: [
      "view_dashboard",
      "view_orders",
      "create_order",
      "edit_order",
      "update_order_status",
      "cancel_order",
      "refund_order",
      "view_kds",
      "manage_products",
      "manage_inventory",
      "manage_customers",
      "manage_staff",
      "manage_settings",
      "view_reports",
      "manage_tables",
      "manage_shifts",
      "manage_reservations",
    ],
    manager: [
      "view_dashboard",
      "view_orders",
      "create_order",
      "edit_order",
      "update_order_status",
      "cancel_order",
      "refund_order",
      "view_kds",
      "manage_products",
      "manage_inventory",
      "manage_customers",
      "view_reports",
      "manage_tables",
      "manage_shifts",
      "manage_reservations",
    ],
    cashier: [
      "create_order",
      "view_orders",
      "update_order_status",
      "manage_tables",
      "manage_customers",
      "manage_shifts",
      "manage_reservations",
    ],
    barista: ["view_kds", "update_order_status", "view_orders"],
    staff: ["create_order", "view_orders", "manage_tables", "view_kds", "update_order_status"],
  },
  updatedAt: new Date(),
};
