import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: Types.ObjectId;
  description?: string;
  imageUrl?: string;
  available: boolean;
  sizes: {
    small?: number;
    large?: number;
    extraLarge?: number;
  };
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    description: { type: String },
    imageUrl: { type: String },
    available: { type: Boolean, default: true },
    sizes: {
      small: { type: Number, required: false },
      large: { type: Number, required: false },
      extraLarge: { type: Number, required: false },
    },
  },
  { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);
