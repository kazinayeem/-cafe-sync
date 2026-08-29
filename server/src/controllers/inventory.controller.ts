import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Product } from "../models/Product";
import { InventoryMovement } from "../models/InventoryMovement";
import { ActivityLog } from "../models/ActivityLog";
import { io } from "../index";

// Get inventory overview + list
export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const { filter, search } = req.query;
    const query: any = {};

    if (search) {
      query.name = new RegExp(search as string, "i");
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ name: 1 });

    const totalSKUs = products.length;
    const inStockCount = products.filter((p) => p.stockQuantity > p.minStockLevel).length;
    const lowStockCount = products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel
    ).length;
    const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;

    let filtered = products;
    if (filter === "low_stock") {
      filtered = products.filter(
        (p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockLevel
      );
    } else if (filter === "out_of_stock") {
      filtered = products.filter((p) => p.stockQuantity <= 0);
    } else if (filter === "in_stock") {
      filtered = products.filter((p) => p.stockQuantity > p.minStockLevel);
    }

    return res.json({
      success: true,
      data: {
        summary: {
          totalSKUs,
          inStockCount,
          lowStockCount,
          outOfStockCount,
        },
        items: filtered,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Adjust stock (add / deduct / set)
export const adjustStock = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, type, quantity, reason, newStockLevel, minStockLevel } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const previousStock = product.stockQuantity;
    let newStock = previousStock;

    if (type === "in") {
      newStock = previousStock + Math.abs(Number(quantity));
    } else if (type === "out" || type === "waste") {
      newStock = Math.max(0, previousStock - Math.abs(Number(quantity)));
    } else if (type === "adjustment") {
      newStock = Number(newStockLevel !== undefined ? newStockLevel : quantity);
    }

    product.stockQuantity = newStock;
    if (minStockLevel !== undefined) {
      product.minStockLevel = Number(minStockLevel);
    }
    // Update availability flag based on stock
    product.available = newStock > 0;
    await product.save();

    const movement = await InventoryMovement.create({
      product: product._id,
      type: type || "adjustment",
      quantity: newStock - previousStock,
      previousStock,
      newStock,
      reason: reason || "Manual inventory adjustment",
      staff: req.user?.id,
    });

    await ActivityLog.create({
      user: req.user?.id,
      action: `Stock adjusted for [${product.name}]: ${previousStock} -> ${newStock} (${reason || type})`,
      category: "inventory",
      details: { productId: product._id, previousStock, newStock },
    });

    io.emit("stockUpdated", {
      productId: product._id,
      stockQuantity: product.stockQuantity,
      available: product.available,
    });

    return res.json({
      success: true,
      data: { product, movement },
      message: `Stock updated to ${newStock} ${product.unit}`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get inventory movement logs / history
export const getInventoryHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, limit = 50 } = req.query;
    const query: any = {};
    if (productId) query.product = productId;

    const movements = await InventoryMovement.find(query)
      .populate("product", "name unit")
      .populate("staff", "name role")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({ success: true, data: movements });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
