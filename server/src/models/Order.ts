import { Schema, model, Document } from "mongoose";
import { IProduct } from "./Product";

export interface IOrderItem {
  product: IProduct["_id"];
  quantity: number;
}

export interface IOrder extends Document {
  items: IOrderItem[];
  totalPrice: number;
  status: "pending" | "preparing" | "served" | "cancelled";
  paymentMethod: "cash" | "card" | "online";
  createdAt: Date;
  updatedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "served", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online"],
      default: "cash",
    },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", orderSchema);
