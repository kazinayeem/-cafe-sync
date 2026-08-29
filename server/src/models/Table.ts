import { Schema, model, Document, Types } from "mongoose";

export interface ITable extends Document {
  name: string;
  seats: number;
  section: string;
  shape: "square" | "round" | "rectangle";
  posX: number;
  posY: number;
  status: "free" | "occupied" | "reserved" | "cleaning";
  activeOrder?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tableSchema = new Schema<ITable>(
  {
    name: { type: String, required: true },
    seats: { type: Number, required: true, default: 4 },
    section: { type: String, default: "Main Hall" },
    shape: {
      type: String,
      enum: ["square", "round", "rectangle"],
      default: "square",
    },
    posX: { type: Number, default: 0 },
    posY: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["free", "occupied", "reserved", "cleaning"],
      default: "free",
    },
    activeOrder: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

export const Table = model<ITable>("Table", tableSchema);
