import { Schema, model, Document, Types } from "mongoose";

export interface ILoyaltyTransaction extends Document {
  customer: Types.ObjectId;
  order?: Types.ObjectId;
  points: number; // Positive for earned/adjusted, negative for redeemed
  type: "earned" | "redeemed" | "adjusted";
  description?: string;
  createdAt: Date;
}

const loyaltyTransactionSchema = new Schema<ILoyaltyTransaction>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    points: { type: Number, required: true },
    type: {
      type: String,
      enum: ["earned", "redeemed", "adjusted"],
      required: true,
    },
    description: { type: String },
  },
  { timestamps: true }
);

export const LoyaltyTransaction = model<ILoyaltyTransaction>(
  "LoyaltyTransaction",
  loyaltyTransactionSchema
);
