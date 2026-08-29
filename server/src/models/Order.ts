import { Schema, model, Document, Types } from "mongoose";
import { IProduct } from "./Product";
import { ITable } from "./Table";
import { ICustomer } from "./Customer";

export interface ISelectedModifier {
  groupName: string;
  optionName: string;
  price: number;
}

export interface IOrderItem {
  product: IProduct["_id"];
  name?: string;
  quantity: number;
  size: string;
  price: number; // base unit price
  modifiersPrice?: number; // total modifiers per unit
  selectedModifiers?: ISelectedModifier[];
  itemNote?: string;
}

export interface IPaymentRecord {
  method: "cash" | "card" | "online" | "bkash" | "nagad" | "loyalty";
  amount: number;
  transactionId?: string;
  date: Date;
}

export interface IRefundRecord {
  amount: number;
  reason: string;
  refundedBy?: Types.ObjectId;
  date: Date;
}

export interface IOrder extends Document {
  customOrderID: string;
  customer?: Types.ObjectId | ICustomer;
  orderType: "dine_in" | "takeaway" | "delivery";
  items: IOrderItem[];
  subtotal: number;
  totalPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  loyaltyPointsUsed?: number;
  loyaltyDiscount?: number;
  taxRate?: number;
  taxAmount?: number;
  serviceChargeRate?: number;
  serviceChargeAmount?: number;
  amountPaid: number;
  changeDue?: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "served"
    | "completed"
    | "cancelled";
  paymentStatus:
    | "unpaid"
    | "paid"
    | "partial"
    | "refunded"
    | "partially_refunded";
  paymentMethod: "cash" | "card" | "online" | "bkash" | "nagod" | "split";
  payments: IPaymentRecord[];
  refunds: IRefundRecord[];
  table?: Types.ObjectId | ITable;
  orderNote?: string;
  cashier?: Types.ObjectId;
  shift?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const selectedModifierSchema = new Schema<ISelectedModifier>(
  {
    groupName: { type: String, required: true },
    optionName: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  modifiersPrice: { type: Number, default: 0 },
  selectedModifiers: [selectedModifierSchema],
  itemNote: { type: String },
});

const paymentRecordSchema = new Schema<IPaymentRecord>(
  {
    method: {
      type: String,
      enum: ["cash", "card", "online", "bkash", "nagad", "loyalty"],
      required: true,
    },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const refundRecordSchema = new Schema<IRefundRecord>(
  {
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    refundedBy: { type: Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    customOrderID: { type: String, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
    orderType: {
      type: String,
      enum: ["dine_in", "takeaway", "delivery"],
      default: "dine_in",
    },
    items: [orderItemSchema],
    subtotal: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    loyaltyPointsUsed: { type: Number, default: 0 },
    loyaltyDiscount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    serviceChargeRate: { type: Number, default: 0 },
    serviceChargeAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    changeDue: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "served",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "partial", "refunded", "partially_refunded"],
      default: "paid",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "online", "bkash", "nagod", "nagad", "split"],
      default: "cash",
    },
    payments: [paymentRecordSchema],
    refunds: [refundRecordSchema],
    table: { type: Schema.Types.ObjectId, ref: "Table" },
    orderNote: { type: String },
    cashier: { type: Schema.Types.ObjectId, ref: "User" },
    shift: { type: Schema.Types.ObjectId, ref: "Shift" },
  },
  { timestamps: true }
);

// Auto-generate customOrderID
orderSchema.pre("save", async function (next) {
  if (!this.customOrderID) {
    const now = new Date();
    const year = now.getFullYear();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const datePrefix = `ORD-${year}-${day}-${month}`;

    const lastOrder = await Order.findOne({
      customOrderID: { $regex: `^${datePrefix}` },
    }).sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastOrder && lastOrder.customOrderID) {
      const parts = lastOrder.customOrderID.split("-");
      const lastNumber = parseInt(parts[4]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    this.customOrderID = `${datePrefix}-${nextNumber}`;
  }
  next();
});

export const Order = model<IOrder>("Order", orderSchema);
