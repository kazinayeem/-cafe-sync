import { Schema, model, Document } from "mongoose";

export interface ITable extends Document {
  name: string;
  seats: number;
  status: "free" | "occupied";
}

const tableSchema = new Schema<ITable>(
  {
    name: { type: String, required: true },
    seats: { type: Number, required: true },
    status: { type: String, enum: ["free", "occupied"], default: "free" },
  },
  { timestamps: true }
);

export const Table = model<ITable>("Table", tableSchema);
