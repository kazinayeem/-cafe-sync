import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import {
  uploadToCloudinary,
  uploadBase64ToCloudinary,
} from "../utils/cloudinary";

const handleError = (
  res: Response,
  message: string,
  error?: any,
  status = 500
) =>
  res
    .status(status)
    .json({ success: false, message, error: error?.message || error });

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      description,
      available,
      sizes,
      stockQuantity,
      minStockLevel,
      trackInventory,
      unit,
      modifierGroups,
    } = req.body;

    if (!name || !category)
      return handleError(res, "Name and category are required", null, 400);

    const cat = await Category.findById(category);
    if (!cat) return handleError(res, "Category not found", null, 404);

    let imageUrl = req.body.imageUrl || "";
    if (req.file) {
      try {
        const uploadRes = await uploadToCloudinary(req.file.buffer, "cafe_sync/products");
        imageUrl = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error, falling back to base64:", uploadErr);
        const base64 = req.file.buffer.toString("base64");
        imageUrl = `data:${req.file.mimetype};base64,${base64}`;
      }
    } else if (req.body.imageBase64 || (typeof imageUrl === "string" && imageUrl.startsWith("data:image"))) {
      try {
        const base64Data = req.body.imageBase64 || imageUrl;
        imageUrl = await uploadBase64ToCloudinary(base64Data, "cafe_sync/products");
      } catch (uploadErr) {
        console.error("Cloudinary base64 upload error:", uploadErr);
      }
    }

    let parsedSizes = sizes;
    if (typeof sizes === "string") {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        parsedSizes = { small: 0, large: 0, extraLarge: 0 };
      }
    }

    let parsedModifierGroups = modifierGroups;
    if (typeof modifierGroups === "string") {
      try {
        parsedModifierGroups = JSON.parse(modifierGroups);
      } catch (e) {
        parsedModifierGroups = [];
      }
    }

    const product = new Product({
      name,
      category,
      description,
      imageUrl,
      available: available === "true" || available === true,
      stockQuantity: Number(stockQuantity) || 100,
      minStockLevel: Number(minStockLevel) || 10,
      trackInventory: trackInventory === "true" || trackInventory === true,
      unit: unit || "pcs",
      sizes: parsedSizes || { small: 0, large: 0, extraLarge: 0 },
      modifierGroups: parsedModifierGroups || [],
    });
    await product.save();

    await Category.findByIdAndUpdate(category, {
      $push: { items: product._id },
    });

    await product.populate("category modifierGroups");

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    handleError(res, "Error creating product", error);
  }
};

export const getProducts = async (_: Request, res: Response) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("modifierGroups")
      .sort({ name: 1 });
    res.json({ success: true, data: products });
  } catch (error) {
    handleError(res, "Error fetching products", error);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("modifierGroups");
    if (!product) return handleError(res, "Product not found", null, 404);
    res.json({ success: true, data: product });
  } catch (error) {
    handleError(res, "Error fetching product", error);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      available,
      stockQuantity,
      minStockLevel,
      trackInventory,
      unit,
      modifierGroups,
      "sizes[small]": small,
      "sizes[large]": large,
      "sizes[extraLarge]": extraLarge,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return handleError(res, "Product not found", null, 404);

    if (name) product.name = name;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    if (available !== undefined) {
      product.available = available === "true" || available === true;
    }
    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
    if (minStockLevel !== undefined) product.minStockLevel = Number(minStockLevel);
    if (trackInventory !== undefined) {
      product.trackInventory = trackInventory === "true" || trackInventory === true;
    }
    if (unit) product.unit = unit;

    if (modifierGroups !== undefined) {
      if (typeof modifierGroups === "string") {
        try {
          product.modifierGroups = JSON.parse(modifierGroups);
        } catch (e) {}
      } else if (Array.isArray(modifierGroups)) {
        product.modifierGroups = modifierGroups;
      }
    }

    if (small !== undefined || large !== undefined || extraLarge !== undefined) {
      product.sizes = {
        small: small !== undefined ? Number(small) : product.sizes.small,
        large: large !== undefined ? Number(large) : product.sizes.large,
        extraLarge: extraLarge !== undefined ? Number(extraLarge) : product.sizes.extraLarge,
      };
    }

    if (req.file) {
      try {
        const uploadRes = await uploadToCloudinary(req.file.buffer, "cafe_sync/products");
        product.imageUrl = uploadRes.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload error, falling back to base64:", uploadErr);
        const base64 = req.file.buffer.toString("base64");
        product.imageUrl = `data:${req.file.mimetype};base64,${base64}`;
      }
    } else if (req.body.imageUrl && req.body.imageUrl.startsWith("data:image")) {
      try {
        product.imageUrl = await uploadBase64ToCloudinary(req.body.imageUrl, "cafe_sync/products");
      } catch (uploadErr) {
        product.imageUrl = req.body.imageUrl;
      }
    } else if (req.body.imageUrl !== undefined) {
      product.imageUrl = req.body.imageUrl;
    }

    await product.save();

    if (category && product.category.toString() !== category) {
      if (product.category) {
        await Category.findByIdAndUpdate(product.category, {
          $pull: { items: product._id },
        });
      }
      await Category.findByIdAndUpdate(category, {
        $addToSet: { items: product._id },
      });
    }

    await product.populate("category modifierGroups");
    res.json({ success: true, data: product });
  } catch (error) {
    handleError(res, "Error updating product", error);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return handleError(res, "Product not found", null, 404);

    await Category.findByIdAndUpdate(product.category, {
      $pull: { items: product._id },
    });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    handleError(res, "Error deleting product", error);
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return handleError(res, "Search query is required", null, 400);

    const regex = new RegExp(q as string, "i");
    const results = await Product.find({ name: regex })
      .populate("category", "name")
      .populate("modifierGroups");
    res.json({ success: true, data: results });
  } catch (error) {
    handleError(res, "Error searching products", error);
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate({
      path: "items",
      populate: { path: "modifierGroups" },
    });
    if (!category) return handleError(res, "Category not found", null, 404);

    res.json({ success: true, data: category.items });
  } catch (error) {
    handleError(res, "Error fetching products by category", error);
  }
};
