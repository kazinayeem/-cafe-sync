import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";

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
    const { name, category, description, imageUrl, available, sizes } =
      req.body;
    if (!name || !category)
      return handleError(res, "Name and category are required", null, 400);

    const cat = await Category.findById(category);
    if (!cat) return handleError(res, "Category not found", null, 404);

    const product = new Product({
      name,
      category,
      description,
      imageUrl,
      available,
      sizes,
    });
    await product.save();

    await Category.findByIdAndUpdate(category, {
      $push: { items: product._id },
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    handleError(res, "Error creating product", error);
  }
};

export const getProducts = async (_: Request, res: Response) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.json({ success: true, data: products });
  } catch (error) {
    handleError(res, "Error fetching products", error);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) return handleError(res, "Product not found", null, 404);
    res.json({ success: true, data: product });
  } catch (error) {
    handleError(res, "Error fetching product", error);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, ...rest } = req.body;

    // get existing product
    const product = await Product.findById(id);
    if (!product) return handleError(res, "Product not found", null, 404);

    const oldCategoryId = product.category?.toString();

    // update fields
    if (category) product.category = category;
    Object.assign(product, rest);
    await product.save();

    // if category changed, update both old and new
    if (category && oldCategoryId !== category) {
      if (oldCategoryId) {
        await Category.findByIdAndUpdate(oldCategoryId, {
          $pull: { items: product._id },
        });
      }
      await Category.findByIdAndUpdate(category, {
        $addToSet: { items: product._id },
      });
    }

    await product.populate("category", "name");
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
    const results = await Product.find({ name: regex }).populate(
      "category",
      "name"
    );
    res.json({ success: true, data: results });
  } catch (error) {
    handleError(res, "Error searching products", error);
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate("items");
    if (!category) return handleError(res, "Category not found", null, 404);

    res.json({ success: true, data: category.items });
  } catch (error) {
    handleError(res, "Error fetching products by category", error);
  }
};
