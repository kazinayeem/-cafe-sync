import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier" | "barista" | "staff" | "customer";
  position?: "barista" | "manager" | "cashier";
  phone?: string;
  passwordHash?: string;
  active: boolean;
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: {
      type: String,
      enum: ["admin", "manager", "cashier", "barista", "staff", "customer"],
      default: "cashier",
      index: true,
    },
    position: {
      type: String,
      enum: ["barista", "manager", "cashier"],
    },
    phone: { type: String },
    passwordHash: { type: String },
    active: { type: Boolean, default: true },
    permissions: [{ type: String }],
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
