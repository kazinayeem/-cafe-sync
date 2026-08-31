import { Request, Response } from "express";
import mongoose from "mongoose";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { Table } from "../models/Table";
import { Order } from "../models/Order";
import { SettingModel, defaultSettings } from "../models/Settings";
import { ActivityLog } from "../models/ActivityLog";
import { io } from "../index";
import { broadcastStats } from "../utils/broadcastStats";

// Get general public menu & cafe info
export const getPublicMenu = async (req: Request, res: Response) => {
  try {
    const settings = (await SettingModel.findOne()) || defaultSettings;
    const categories = await Category.find().sort({ name: 1 });
    const products = await Product.find({ available: true })
      .populate("category", "name")
      .populate("modifierGroups")
      .sort({ name: 1 });

    return res.json({
      success: true,
      data: {
        business: {
          name: settings.businessName || "BornoCafe",
          address: settings.address || "",
          phone: settings.phone || "",
          website: settings.website || "",
          currency: settings.currency || "BDT",
          openingTime: settings.openingTime || "08:00",
          closingTime: settings.closingTime || "23:00",
          offDays: settings.offDays || [],
          taxRate: settings.taxRate ?? 5,
          serviceCharge: settings.serviceCharge ?? 0,
          enableCustomerSelfOrdering: settings.enableCustomerSelfOrdering !== false,
        },
        categories,
        products,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Validate QR Token and get table information + menu
export const getTableByQrToken = async (req: Request, res: Response) => {
  try {
    const { qrToken, tableId } = req.params;
    const targetToken = qrToken || tableId;

    if (!targetToken) {
      return res.status(400).json({ success: false, message: "QR Token or Table ID is required" });
    }

    let table = await Table.findOne({ qrToken: targetToken });
    if (!table && mongoose.isValidObjectId(targetToken)) {
      table = await Table.findById(targetToken);
    }
    if (!table) {
      table = await Table.findOne({ name: targetToken });
    }

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "This table QR code is invalid or inactive. Please ask a staff member for assistance.",
      });
    }

    const settings = (await SettingModel.findOne()) || defaultSettings;
    const categories = await Category.find().sort({ name: 1 });
    const products = await Product.find({ available: true })
      .populate("category", "name")
      .populate("modifierGroups")
      .sort({ name: 1 });

    return res.json({
      success: true,
      data: {
        table: {
          _id: table._id,
          name: table.name,
          section: table.section,
          seats: table.seats,
          status: table.status,
          qrToken: table.qrToken,
        },
        business: {
          name: settings.businessName || "BornoCafe",
          address: settings.address || "",
          phone: settings.phone || "",
          website: settings.website || "",
          currency: settings.currency || "BDT",
          taxRate: settings.taxRate ?? 5,
          serviceCharge: settings.serviceCharge ?? 0,
          enableCustomerSelfOrdering: settings.enableCustomerSelfOrdering !== false,
        },
        categories,
        products,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Submit a new Smart QR Order
export const createQrOrder = async (req: Request, res: Response) => {
  try {
    const { qrToken, tableId, items, guestName, guestPhone, orderNote } = req.body;
    const targetToken = qrToken || tableId;

    if (!targetToken) {
      return res.status(400).json({ success: false, message: "QR Token or Table ID is required" });
    }

    const settings = (await SettingModel.findOne()) || defaultSettings;

    // Server-side verification that Customer Self-Ordering is active
    if (settings.enableCustomerSelfOrdering === false) {
      return res.status(403).json({
        success: false,
        message: "Customer self-ordering is currently unavailable. Please place your order directly at the cashier counter.",
      });
    }

    let table = null;
    if (targetToken && targetToken !== "counter" && targetToken !== "takeaway") {
      table = await Table.findOne({ qrToken: targetToken });
      if (!table && mongoose.isValidObjectId(targetToken)) {
        table = await Table.findById(targetToken);
      }
      if (!table) {
        table = await Table.findOne({ name: targetToken });
      }
    }

    if (targetToken && !table && targetToken !== "counter" && targetToken !== "takeaway") {
      return res.status(404).json({
        success: false,
        message: "Invalid table QR code. Please scan the QR code at your table again.",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart cannot be empty" });
    }

    const taxRate = settings.taxRate ?? 5;
    const serviceChargeRate = settings.serviceCharge ?? 0;

    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (!product.available) {
        return res.status(400).json({
          success: false,
          message: `Sorry, ${product.name} is currently out of stock.`,
        });
      }

      // Base price by size
      let unitPrice = 0;
      if (item.size === "large" && product.sizes?.large) {
        unitPrice = product.sizes.large;
      } else if (item.size === "extraLarge" && product.sizes?.extraLarge) {
        unitPrice = product.sizes.extraLarge;
      } else {
        unitPrice = product.sizes?.small || 0;
      }

      // Modifiers price
      let modifiersPrice = 0;
      const selectedMods = Array.isArray(item.selectedModifiers) ? item.selectedModifiers : [];
      for (const mod of selectedMods) {
        modifiersPrice += Number(mod.price) || 0;
      }

      const itemTotal = (unitPrice + modifiersPrice) * (Number(item.quantity) || 1);
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: Number(item.quantity) || 1,
        size: item.size || "small",
        price: unitPrice,
        modifiersPrice,
        selectedModifiers: selectedMods,
        itemNote: item.itemNote || "",
      });

      // Auto deduct inventory if tracked
      if (product.trackInventory) {
        const newStock = Math.max(0, product.stockQuantity - (Number(item.quantity) || 1));
        await Product.findByIdAndUpdate(product._id, { stockQuantity: newStock });
      }
    }

    const taxAmount = (subtotal * taxRate) / 100;
    const serviceChargeAmount = (subtotal * serviceChargeRate) / 100;
    const totalPrice = Number((subtotal + taxAmount + serviceChargeAmount).toFixed(2));

    const order = new Order({
      source: "qr",
      guestName: guestName || (table ? `Guest at ${table.name}` : "Guest Customer"),
      guestPhone: guestPhone || "",
      orderType: table ? "dine_in" : (req.body.orderType || "takeaway"),
      items: orderItems,
      subtotal,
      taxRate,
      taxAmount,
      serviceChargeRate: table ? serviceChargeRate : 0,
      serviceChargeAmount: table ? serviceChargeAmount : 0,
      totalPrice,
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: "cash",
      table: table ? table._id : undefined,
      orderNote: orderNote || "",
    });

    await order.save();

    // Mark table as occupied if free
    if (table && table.status === "free") {
      table.status = "occupied";
      table.activeOrder = order._id as any;
      await table.save();
      io.emit("tableStatusUpdated", { id: table._id, status: "occupied" });
    }

    // Populate for broadcasts
    const populatedOrder = await Order.findById(order._id)
      .populate("table", "name section seats")
      .populate("items.product", "name imageUrl category");

    const tableName = table ? table.name : "Customer Mobile";

    // Realtime Broadcast to KDS, POS, Display & Stats
    io.emit("newOrder", populatedOrder);
    io.emit("newCustomerSelfOrder", {
      order: populatedOrder,
      orderId: order._id,
      customOrderID: order.customOrderID,
      orderToken: order.orderToken,
      table: tableName,
      tableName: tableName,
      totalPrice: order.totalPrice,
      itemsSummary: orderItems.map((i) => `${i.quantity} × ${i.name}`).join(", "),
      itemsCount: orderItems.length,
      guestName: order.guestName,
      createdAt: order.createdAt,
    });
    io.emit("orderStatusUpdated", {
      orderId: order._id,
      customOrderID: order.customOrderID,
      orderToken: order.orderToken,
      status: order.status,
      table: tableName,
    });
    io.emit("displayUpdate");
    await broadcastStats();

    await ActivityLog.create({
      action: "order_created",
      details: `Customer QR order placed: #${order.orderToken} (${order.customOrderID}) for ${tableName}`,
    });

    return res.status(201).json({
      success: true,
      data: populatedOrder,
      message: "Order placed successfully! Keep your tracking screen open.",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Track customer order status in real time
export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    let order;

    if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(orderId)
        .populate("table", "name section seats")
        .populate("items.product", "name imageUrl");
    } else {
      order = await Order.findOne({
        $or: [{ customOrderID: orderId }, { orderToken: orderId.toUpperCase() }],
      })
        .populate("table", "name section seats")
        .populate("items.product", "name imageUrl");
    }

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const settings = (await SettingModel.findOne()) || defaultSettings;

    return res.json({
      success: true,
      data: {
        order,
        business: {
          name: settings.businessName || "BornoCafe",
          phone: settings.phone || "",
          currency: settings.currency || "BDT",
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get live orders for Cafe Customer Display screen (/display)
export const getDisplayOrders = async (req: Request, res: Response) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const activeOrders = await Order.find({
      createdAt: { $gte: startOfToday },
      status: { $in: ["pending", "confirmed", "preparing", "ready", "completed"] },
    })
      .select("orderToken customOrderID status orderType table createdAt updatedAt")
      .populate("table", "name")
      .sort({ updatedAt: -1 });

    const preparing = activeOrders
      .filter((o) => ["pending", "confirmed", "preparing"].includes(o.status))
      .map((o) => ({
        _id: o._id,
        orderToken: o.orderToken || o.customOrderID?.slice(-4),
        customOrderID: o.customOrderID,
        status: o.status,
        table: (o.table as any)?.name || "Takeaway",
        updatedAt: o.updatedAt,
      }));

    const ready = activeOrders
      .filter((o) => o.status === "ready")
      .map((o) => ({
        _id: o._id,
        orderToken: o.orderToken || o.customOrderID?.slice(-4),
        customOrderID: o.customOrderID,
        status: o.status,
        table: (o.table as any)?.name || "Takeaway",
        updatedAt: o.updatedAt,
      }));

    // Completed within last 10 minutes
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCompleted = activeOrders
      .filter((o) => o.status === "completed" && new Date(o.updatedAt) >= tenMinsAgo)
      .map((o) => ({
        _id: o._id,
        orderToken: o.orderToken || o.customOrderID?.slice(-4),
        customOrderID: o.customOrderID,
        status: o.status,
        table: (o.table as any)?.name || "Takeaway",
        updatedAt: o.updatedAt,
      }));

    return res.json({
      success: true,
      data: {
        preparing,
        ready,
        recentCompleted,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
