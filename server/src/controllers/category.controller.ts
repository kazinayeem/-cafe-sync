import { Request, Response } from "express";
import { Category } from "../models/Category";

// ✅ Create a new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, items } = req.body;

    const category = new Category({ name, items });
    await category.save();

    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error creating category", error });
  }
};

// 📂 Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().populate("items");
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error fetching categories", error });
  }
};

// 📂 Get single category (with products)
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).populate("items");

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error fetching category", error });
  }
};

// ✏️ Update category
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, items } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, items },
      { new: true }
    ).populate("items");

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error updating category", error });
  }
};

// ❌ Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error deleting category", error });
  }
};
