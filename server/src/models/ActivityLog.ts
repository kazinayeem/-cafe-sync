import { Schema, model, Document, Types } from "mongoose";

export interface IActivityLog extends Document {
  user?: Types.ObjectId;
  action: string;
  category: "order" | "inventory" | "auth" | "shift" | "payment" | "table" | "settings";
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    category: {
      type: String,
      enum: ["order", "inventory", "auth", "shift", "payment", "table", "settings"],
      required: true,
      index: true,
    },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export const ActivityLog = model<IActivityLog>("ActivityLog", activityLogSchema);
