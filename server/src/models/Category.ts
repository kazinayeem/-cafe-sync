import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  items?: Schema.Types.ObjectId[];
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    items: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export const Category = model<ICategory>("Category", categorySchema);
