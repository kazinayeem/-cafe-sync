import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  position?: "barista" | "manager" | "cashier"; // for staff
  phone?: string;
  passwordHash?: string;
  active: boolean; // to manage active/inactive
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["admin", "staff", "customer", "cashier", "manager", "barista"],
      default: "customer",
    },
    position: {
      type: String,
      enum: ["barista", "manager", "cashier"],
    },
    phone: { type: String },
    passwordHash: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
