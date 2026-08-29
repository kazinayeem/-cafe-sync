import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Order } from "../models/Order";
import { Table } from "../models/Table";
import { Product } from "../models/Product";
import { Customer } from "../models/Customer";
import { LoyaltyTransaction } from "../models/LoyaltyTransaction";
import { Shift } from "../models/Shift";
import { InventoryMovement } from "../models/InventoryMovement";
import { ActivityLog } from "../models/ActivityLog";
import { SettingModel, defaultSettings } from "../models/Settings";
import { getTodayOrderSummary } from "./orderSummaryService.controller";
import { io } from "../index";

export const getTodayOrderSummaryController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const summary = await getTodayOrderSummary();
    return res.status(200).json({ success: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Create new POS Order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      items,
      paymentMethod,
      payments,
      tableId,
      customerId,
      discountPercent = 0,
      taxRate = 0,
      serviceChargeRate = 0,
      orderType = "dine_in",
      orderNote,
      loyaltyPointsUsed = 0,
    } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided in order" });
    }

    const settings = (await SettingModel.findOne()) || defaultSettings;

    // Calculate subtotal including modifiers
    let subtotal = 0;
    const processedItems = items.map((item: any) => {
      const basePrice = Number(item.price) || 0;
      const modPrice = (item.selectedModifiers || []).reduce(
        (mSum: number, m: any) => mSum + (Number(m.price) || 0),
        0
      );
      const unitTotal = basePrice + modPrice;
      const itemQuantity = Number(item.quantity) || 1;
      subtotal += unitTotal * itemQuantity;

      return {
        product: item.productId || item.product,
        name: item.name,
        quantity: itemQuantity,
        size: item.size || "Regular",
        price: basePrice,
        modifiersPrice: modPrice,
        selectedModifiers: item.selectedModifiers || [],
        itemNote: item.itemNote || "",
      };
    });

    const discPercent = Number(discountPercent) || 0;
    const discountAmount = (subtotal * discPercent) / 100;

    // Loyalty point redemption calculation
    let loyaltyDiscount = 0;
    const pointsUsed = Number(loyaltyPointsUsed) || 0;
    if (pointsUsed > 0 && settings.enableLoyalty) {
      loyaltyDiscount = pointsUsed * (settings.loyaltyRedeemRate || 0.5);
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount - loyaltyDiscount);
    const taxRateVal = Number(taxRate) || 0;
    const taxAmount = (discountedSubtotal * taxRateVal) / 100;
    const serviceRateVal = Number(serviceChargeRate) || 0;
    const serviceChargeAmount = (discountedSubtotal * serviceRateVal) / 100;

    const totalPrice = Number((discountedSubtotal + taxAmount + serviceChargeAmount).toFixed(2));

    // Handle payments
    let amountPaid = 0;
    let paymentRecords = payments && Array.isArray(payments) ? payments : [];
    if (paymentRecords.length === 0 && paymentMethod) {
      paymentRecords = [
        {
          method: paymentMethod,
          amount: totalPrice,
          date: new Date(),
        },
      ];
    }
    amountPaid = paymentRecords.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    const paymentStatus =
      amountPaid >= totalPrice
        ? "paid"
        : amountPaid > 0
        ? "partial"
        : "unpaid";

    // Find active shift for cashier
    const activeShift = await Shift.findOne({
      cashier: req.user?.id,
      status: "open",
    });

    const order = await Order.create({
      items: processedItems,
      subtotal,
      discountPercent: discPercent,
      discountAmount,
      loyaltyPointsUsed: pointsUsed,
      loyaltyDiscount,
      taxRate: taxRateVal,
      taxAmount,
      serviceChargeRate: serviceRateVal,
      serviceChargeAmount,
      totalPrice,
      amountPaid,
      changeDue: Math.max(0, amountPaid - totalPrice),
      paymentMethod: paymentRecords.length > 1 ? "split" : paymentMethod || "cash",
      paymentStatus,
      payments: paymentRecords,
      status: "pending",
      orderType,
      orderNote,
      table: tableId || null,
      customer: customerId || null,
      cashier: req.user?.id || null,
      shift: activeShift?._id || null,
    });

    // Populate order references
    await order.populate("table customer cashier items.product");

    // Table occupancy update
    if (tableId) {
      await Table.findByIdAndUpdate(tableId, {
        status: "occupied",
        activeOrder: order._id,
      });
      io.emit("tableStatusUpdated", { id: tableId, status: "occupied" });
    }

    // Customer loyalty & stats update
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (customer) {
        customer.totalOrders += 1;
        customer.totalSpent += totalPrice;
        customer.lastVisit = new Date();

        // Earn loyalty points on order
        if (settings.enableLoyalty && settings.loyaltyEarnRate > 0) {
          const earnedPoints = Math.floor(
            (totalPrice / 100) * settings.loyaltyEarnRate
          );
          if (earnedPoints > 0) {
            customer.loyaltyPoints += earnedPoints;
            await LoyaltyTransaction.create({
              customer: customer._id,
              order: order._id,
              points: earnedPoints,
              type: "earned",
              description: `Points earned on order #${order.customOrderID}`,
            });
          }
        }

        // Deduct redeemed points
        if (pointsUsed > 0) {
          customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - pointsUsed);
          await LoyaltyTransaction.create({
            customer: customer._id,
            order: order._id,
            points: -pointsUsed,
            type: "redeemed",
            description: `Points redeemed on order #${order.customOrderID}`,
          });
        }

        await customer.save();
      }
    }

    // Automatic Inventory Deduction
    for (const item of processedItems) {
      const prod = await Product.findById(item.product);
      if (prod && prod.trackInventory) {
        const prev = prod.stockQuantity;
        prod.stockQuantity = Math.max(0, prev - item.quantity);
        prod.available = prod.stockQuantity > 0;
        await prod.save();

        await InventoryMovement.create({
          product: prod._id,
          type: "order",
          quantity: -item.quantity,
          previousStock: prev,
          newStock: prod.stockQuantity,
          reason: `Order #${order.customOrderID}`,
          order: order._id,
          staff: req.user?.id,
        });

        io.emit("stockUpdated", {
          productId: prod._id,
          stockQuantity: prod.stockQuantity,
          available: prod.available,
        });
      }
    }

    // Emit Realtime Socket Events
    io.emit("newOrder", order);
    const summary = await getTodayOrderSummary();
    io.emit("orderSummaryUpdate", summary);

    await ActivityLog.create({
      user: req.user?.id,
      action: `Created Order #${order.customOrderID} (Total: ৳${totalPrice})`,
      category: "order",
      details: { orderId: order._id, totalPrice },
    });

    return res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get Orders (with pagination & rich multi-filters)
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      orderId,
    } = req.query;

    const query: any = {};
    if (status && status !== "all") query.status = status;
    if (paymentStatus && paymentStatus !== "all") query.paymentStatus = paymentStatus;
    if (paymentMethod && paymentMethod !== "all") query.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    if (orderId) {
      query.customOrderID = {
        $regex: new RegExp(orderId as string, "i"),
      };
    }

    const orders = await Order.find(query)
      .populate("table")
      .populate("customer", "name phone email loyaltyPoints")
      .populate("cashier", "name role")
      .populate({
        path: "items.product",
        select: "name imageUrl category sizes",
      })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    return res.json({
      data: orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get Single Order By ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("items.product")
      .populate("table")
      .populate("customer")
      .populate("cashier", "name role");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update Order (Status Lifecycle, Table, Payment)
export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, paymentMethod, tableId, payments } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const prevStatus = order.status;
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paymentMethod) order.paymentMethod = paymentMethod;

    if (payments && Array.isArray(payments)) {
      order.payments = payments;
      order.amountPaid = payments.reduce(
        (sum: number, p: any) => sum + Number(p.amount || 0),
        0
      );
      order.paymentStatus =
        order.amountPaid >= order.totalPrice
          ? "paid"
          : order.amountPaid > 0
          ? "partial"
          : "unpaid";
    }

    if (tableId !== undefined) {
      order.table = tableId || null;
    }

    // Auto-free table if order is completed or cancelled
    if (order.table && (status === "completed" || status === "served" || status === "cancelled")) {
      if (status === "completed" || status === "cancelled") {
        await Table.findByIdAndUpdate(order.table, {
          status: "free",
          activeOrder: null,
        });
        io.emit("tableStatusUpdated", { id: order.table, status: "free" });
      }
    }

    await order.save();
    await order.populate("table customer cashier items.product");

    io.emit("orderStatusUpdated", order);
    const summary = await getTodayOrderSummary();
    io.emit("orderSummaryUpdate", summary);

    await ActivityLog.create({
      user: req.user?.id,
      action: `Updated Order #${order.customOrderID}: status [${prevStatus} -> ${order.status}]`,
      category: "order",
      details: { orderId: order._id, status: order.status },
    });

    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Process Refund (Full or Partial)
export const refundOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const refundAmount = Number(amount) || order.totalPrice;
    if (refundAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid refund amount required" });
    }

    const totalRefundedSoFar = (order.refunds || []).reduce(
      (sum, r) => sum + r.amount,
      0
    );

    if (totalRefundedSoFar + refundAmount > order.totalPrice) {
      return res.status(400).json({
        success: false,
        message: `Refund amount exceeds remaining order balance. Max refundable: ৳${
          order.totalPrice - totalRefundedSoFar
        }`,
      });
    }

    order.refunds.push({
      amount: refundAmount,
      reason: reason || "Customer request",
      refundedBy: req.user?.id as any,
      date: new Date(),
    });

    const newTotalRefunded = totalRefundedSoFar + refundAmount;
    order.paymentStatus =
      newTotalRefunded >= order.totalPrice ? "refunded" : "partially_refunded";

    await order.save();

    await ActivityLog.create({
      user: req.user?.id,
      action: `Processed refund of ৳${refundAmount} for Order #${order.customOrderID} (Reason: ${reason})`,
      category: "payment",
      details: { orderId: order._id, refundAmount, reason },
    });

    io.emit("orderStatusUpdated", order);

    return res.json({
      success: true,
      data: order,
      message: `Refund of ৳${refundAmount} recorded successfully`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete order
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: "free",
        activeOrder: null,
      });
      io.emit("tableStatusUpdated", { id: order.table, status: "free" });
    }

    const summary = await getTodayOrderSummary();
    io.emit("orderSummaryUpdate", summary);

    await ActivityLog.create({
      user: req.user?.id,
      action: `Deleted Order #${order.customOrderID}`,
      category: "order",
      details: { orderId: order._id },
    });

    return res
      .status(200)
      .json({ success: true, message: "Order deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
