import { Schema, model, Document, Types } from "mongoose";

export interface IShift extends Document {
  cashier: Types.ObjectId;
  openingFloat: number;
  openingTime: Date;
  closingTime?: Date;
  status: "open" | "closed";
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  mobileSales: number;
  totalOrders: number;
  totalDiscounts: number;
  totalRefunds: number;
  closingNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new Schema<IShift>(
  {
    cashier: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    openingFloat: { type: Number, required: true, default: 0 },
    openingTime: { type: Date, required: true, default: Date.now },
    closingTime: { type: Date },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    expectedCash: { type: Number, default: 0 },
    actualCash: { type: Number },
    cashDifference: { type: Number },
    totalSales: { type: Number, default: 0 },
    cashSales: { type: Number, default: 0 },
    cardSales: { type: Number, default: 0 },
    mobileSales: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalDiscounts: { type: Number, default: 0 },
    totalRefunds: { type: Number, default: 0 },
    closingNotes: { type: String },
  },
  { timestamps: true }
);

export const Shift = model<IShift>("Shift", shiftSchema);
