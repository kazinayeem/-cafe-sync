import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: string;
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
    category: {
      type: String,
      required: true,
      ref: "Category",
    },
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
