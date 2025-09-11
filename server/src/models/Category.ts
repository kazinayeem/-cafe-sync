import { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  parentCategoryId?: Schema.Types.ObjectId;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    parentCategoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  { timestamps: true }
);

export const Category = model<ICategory>("Category", categorySchema);
