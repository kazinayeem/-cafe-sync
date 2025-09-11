import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  phone?: string;
  passwordHash?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["admin", "staff", "customer"],
      default: "customer",
    },
    phone: { type: String },
    passwordHash: { type: String },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
