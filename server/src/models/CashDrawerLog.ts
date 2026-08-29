import { Schema, model, Document, Types } from "mongoose";

export interface ICashDrawerLog extends Document {
  shift: Types.ObjectId;
  staff: Types.ObjectId;
  type: "cash_in" | "cash_out" | "cash_drop";
  amount: number;
  reason: string;
  createdAt: Date;
}

const cashDrawerLogSchema = new Schema<ICashDrawerLog>(
  {
    shift: { type: Schema.Types.ObjectId, ref: "Shift", required: true, index: true },
    staff: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["cash_in", "cash_out", "cash_drop"],
      required: true,
    },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

export const CashDrawerLog = model<ICashDrawerLog>(
  "CashDrawerLog",
  cashDrawerLogSchema
);
