import { Schema, model, Document, Types } from "mongoose";

export interface IReservation extends Document {
  customerName: string;
  phone: string;
  email?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guests: number;
  table?: Types.ObjectId;
  status:
    | "upcoming"
    | "confirmed"
    | "seated"
    | "completed"
    | "cancelled"
    | "no_show";
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    date: { type: String, required: true, index: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true, default: 2 },
    table: { type: Schema.Types.ObjectId, ref: "Table" },
    status: {
      type: String,
      enum: [
        "upcoming",
        "confirmed",
        "seated",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "upcoming",
      index: true,
    },
    specialRequests: { type: String },
  },
  { timestamps: true }
);

export const Reservation = model<IReservation>(
  "Reservation",
  reservationSchema
);
