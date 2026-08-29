import { Schema, model, Document } from "mongoose";

export interface IModifierOption {
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface IModifierGroup extends Document {
  name: string;
  required: boolean;
  minSelection: number;
  maxSelection: number;
  options: IModifierOption[];
  createdAt: Date;
  updatedAt: Date;
}

const modifierOptionSchema = new Schema<IModifierOption>({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false },
});

const modifierGroupSchema = new Schema<IModifierGroup>(
  {
    name: { type: String, required: true },
    required: { type: Boolean, default: false },
    minSelection: { type: Number, default: 0 },
    maxSelection: { type: Number, default: 1 },
    options: [modifierOptionSchema],
  },
  { timestamps: true }
);

export const ModifierGroup = model<IModifierGroup>(
  "ModifierGroup",
  modifierGroupSchema
);
