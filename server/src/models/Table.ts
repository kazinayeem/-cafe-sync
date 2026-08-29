import { Schema, model, Document, Types } from "mongoose";
import crypto from "crypto";

export interface ITable extends Document {
  name: string;
  seats: number;
  section: string;
  shape: "square" | "round" | "rectangle";
  posX: number;
  posY: number;
  status: "free" | "occupied" | "reserved" | "cleaning";
  qrToken: string;
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
    qrToken: {
      type: String,
      unique: true,
      index: true,
      default: () => `tbl_${crypto.randomBytes(6).toString("hex")}`,
    },
    activeOrder: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

tableSchema.pre("save", function (next) {
  if (!this.qrToken) {
    this.qrToken = `tbl_${crypto.randomBytes(6).toString("hex")}`;
  }
  next();
});

export const Table = model<ITable>("Table", tableSchema);
