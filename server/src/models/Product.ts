import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: Types.ObjectId;
  description?: string;
  imageUrl?: string;
  available: boolean;
  stockQuantity: number;
  minStockLevel: number;
  trackInventory: boolean;
  unit: string;
  sizes: {
    small?: number;
    large?: number;
    extraLarge?: number;
  };
  modifierGroups?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String },
    imageUrl: { type: String },
    available: { type: Boolean, default: true },
    stockQuantity: { type: Number, default: 100 },
    minStockLevel: { type: Number, default: 10 },
    trackInventory: { type: Boolean, default: true },
    unit: { type: String, default: "pcs" },
    sizes: {
      small: { type: Number, required: false, default: 0 },
      large: { type: Number, required: false, default: 0 },
      extraLarge: { type: Number, required: false, default: 0 },
    },
    modifierGroups: [{ type: Schema.Types.ObjectId, ref: "ModifierGroup" }],
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);
