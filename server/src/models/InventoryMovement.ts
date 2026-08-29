import { Schema, model, Document, Types } from "mongoose";

export interface IInventoryMovement extends Document {
  product: Types.ObjectId;
  type: "in" | "out" | "adjustment" | "order" | "waste";
  quantity: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason?: string;
  order?: Types.ObjectId;
  staff?: Types.ObjectId;
  createdAt: Date;
}

const inventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    type: {
      type: String,
      enum: ["in", "out", "adjustment", "order", "waste"],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String },
    order: { type: Schema.Types.ObjectId, ref: "Order" },
    staff: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const InventoryMovement = model<IInventoryMovement>(
  "InventoryMovement",
  inventoryMovementSchema
);
