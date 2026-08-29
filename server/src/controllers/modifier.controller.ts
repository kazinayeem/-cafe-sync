import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { ModifierGroup } from "../models/ModifierGroup";

// Get all modifier groups
export const getModifierGroups = async (req: AuthRequest, res: Response) => {
  try {
    const groups = await ModifierGroup.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: groups });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create modifier group
export const createModifierGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, required, minSelection, maxSelection, options } = req.body;
    if (!name || !options || !Array.isArray(options)) {
      return res.status(400).json({ success: false, message: "Name and options array are required" });
    }

    const group = await ModifierGroup.create({
      name,
      required: Boolean(required),
      minSelection: Number(minSelection) || 0,
      maxSelection: Number(maxSelection) || 1,
      options,
    });

    return res.status(201).json({ success: true, data: group });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update modifier group
export const updateModifierGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, required, minSelection, maxSelection, options } = req.body;

    const group = await ModifierGroup.findByIdAndUpdate(
      id,
      { name, required, minSelection, maxSelection, options },
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ success: false, message: "Modifier group not found" });
    }

    return res.json({ success: true, data: group });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete modifier group
export const deleteModifierGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const group = await ModifierGroup.findByIdAndDelete(id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Modifier group not found" });
    }

    return res.json({ success: true, message: "Modifier group deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
