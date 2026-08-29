import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Shift } from "../models/Shift";
import { CashDrawerLog } from "../models/CashDrawerLog";
import { Order } from "../models/Order";
import { ActivityLog } from "../models/ActivityLog";
import { io } from "../index";

// Get active shift for current cashier/staff
export const getCurrentShift = async (req: AuthRequest, res: Response) => {
  try {
    const shift = await Shift.findOne({
      cashier: req.user?.id,
      status: "open",
    }).populate("cashier", "name email role");

    let cashDrawerLogs: any[] = [];
    if (shift) {
      cashDrawerLogs = await CashDrawerLog.find({ shift: shift._id }).sort({
        createdAt: -1,
      });
    }

    return res.json({
      success: true,
      data: shift ? { ...shift.toObject(), cashDrawerLogs } : null,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Open a new cashier shift
export const openShift = async (req: AuthRequest, res: Response) => {
  try {
    const { openingFloat } = req.body;
    if (openingFloat === undefined || Number(openingFloat) < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid opening float is required" });
    }

    // Check if an open shift already exists for this user
    const existing = await Shift.findOne({
      cashier: req.user?.id,
      status: "open",
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "You already have an active open shift" });
    }

    const float = Number(openingFloat);
    const shift = await Shift.create({
      cashier: req.user?.id,
      openingFloat: float,
      expectedCash: float,
      openingTime: new Date(),
      status: "open",
    });

    await ActivityLog.create({
      user: req.user?.id,
      action: `Opened shift with starting float: ৳${float}`,
      category: "shift",
      details: { shiftId: shift._id, openingFloat: float },
    });

    io.emit("shiftUpdated", { shiftId: shift._id, status: "open", cashier: req.user?.id });

    return res.status(201).json({ success: true, data: shift });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Log Cash Movement (Cash In, Cash Out, Cash Drop)
export const logCashMovement = async (req: AuthRequest, res: Response) => {
  try {
    const { shiftId, type, amount, reason } = req.body;
    if (!type || amount === undefined || Number(amount) <= 0 || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "Type, positive amount, and reason are required" });
    }

    const shift = await Shift.findById(shiftId || { cashier: req.user?.id, status: "open" });
    if (!shift || shift.status !== "open") {
      return res.status(404).json({ success: false, message: "Active open shift not found" });
    }

    const amt = Number(amount);
    if (type === "cash_in") {
      shift.expectedCash += amt;
    } else if (type === "cash_out" || type === "cash_drop") {
      shift.expectedCash = Math.max(0, shift.expectedCash - amt);
    }

    await shift.save();

    const log = await CashDrawerLog.create({
      shift: shift._id,
      staff: req.user?.id,
      type,
      amount: amt,
      reason,
    });

    await ActivityLog.create({
      user: req.user?.id,
      action: `Cash drawer [${type}]: ৳${amt} (${reason})`,
      category: "shift",
      details: { shiftId: shift._id, logId: log._id },
    });

    return res.status(201).json({ success: true, data: { shift, log } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Close shift with cash drawer reconciliation
export const closeShift = async (req: AuthRequest, res: Response) => {
  try {
    const { shiftId, actualCash, closingNotes } = req.body;
    const shift = await Shift.findById(shiftId);
    if (!shift || shift.status !== "open") {
      return res.status(404).json({ success: false, message: "Active open shift not found" });
    }

    // Aggregate orders processed during this shift
    const orders = await Order.find({ shift: shift._id });
    let totalSales = 0;
    let cashSales = 0;
    let cardSales = 0;
    let mobileSales = 0;
    let totalDiscounts = 0;
    let totalRefunds = 0;

    orders.forEach((ord) => {
      totalSales += ord.totalPrice || 0;
      totalDiscounts += ord.discountAmount || 0;
      if (ord.refunds && ord.refunds.length) {
        totalRefunds += ord.refunds.reduce((sum, r) => sum + r.amount, 0);
      }

      if (ord.payments && ord.payments.length) {
        ord.payments.forEach((p) => {
          if (p.method === "cash") cashSales += p.amount;
          else if (p.method === "card") cardSales += p.amount;
          else if (p.method === "bkash" || p.method === "nagad") mobileSales += p.amount;
        });
      } else {
        if (ord.paymentMethod === "cash") cashSales += ord.totalPrice;
        else if (ord.paymentMethod === "card") cardSales += ord.totalPrice;
        else mobileSales += ord.totalPrice;
      }
    });

    // Cash drawer movements
    const drawerLogs = await CashDrawerLog.find({ shift: shift._id });
    let drawerAdditions = 0;
    let drawerDeductions = 0;
    drawerLogs.forEach((l) => {
      if (l.type === "cash_in") drawerAdditions += l.amount;
      else if (l.type === "cash_out" || l.type === "cash_drop") drawerDeductions += l.amount;
    });

    const expectedCash =
      shift.openingFloat + cashSales + drawerAdditions - drawerDeductions - totalRefunds;

    const actual = actualCash !== undefined ? Number(actualCash) : expectedCash;
    const difference = actual - expectedCash;

    shift.closingTime = new Date();
    shift.status = "closed";
    shift.totalSales = totalSales;
    shift.cashSales = cashSales;
    shift.cardSales = cardSales;
    shift.mobileSales = mobileSales;
    shift.totalOrders = orders.length;
    shift.totalDiscounts = totalDiscounts;
    shift.totalRefunds = totalRefunds;
    shift.expectedCash = expectedCash;
    shift.actualCash = actual;
    shift.cashDifference = difference;
    shift.closingNotes = closingNotes;

    await shift.save();

    await ActivityLog.create({
      user: req.user?.id,
      action: `Closed shift: Total sales ৳${totalSales}, Cash diff: ৳${difference}`,
      category: "shift",
      details: { shiftId: shift._id, actualCash: actual, difference },
    });

    io.emit("shiftUpdated", { shiftId: shift._id, status: "closed", cashier: req.user?.id });

    return res.json({
      success: true,
      data: shift,
      message: "Shift closed and reconciled successfully",
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get shift history (Admin & Manager)
export const getShiftHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 20, cashierId } = req.query;
    const query: any = {};
    if (cashierId) query.cashier = cashierId;

    const shifts = await Shift.find(query)
      .populate("cashier", "name email role position")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    return res.json({ success: true, data: shifts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
