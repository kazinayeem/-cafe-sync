import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { Customer } from "../models/Customer";
import { LoyaltyTransaction } from "../models/LoyaltyTransaction";
import { Order } from "../models/Order";
import { ActivityLog } from "../models/ActivityLog";

// Get all customers (with search & pagination)
export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query: any = {};

    if (search) {
      const regex = new RegExp(search as string, "i");
      query.$or = [{ name: regex }, { phone: regex }, { email: regex }];
    }

    const customers = await Customer.find(query)
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Customer.countDocuments(query);

    return res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get customer by ID with orders and loyalty history
export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const orders = await Order.find({ customer: id })
      .sort({ createdAt: -1 })
      .limit(20);

    const loyaltyHistory = await LoyaltyTransaction.find({ customer: id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json({
      success: true,
      data: {
        customer,
        orders,
        loyaltyHistory,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create customer (or quick create from POS)
export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, email, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and phone number are required" });
    }

    const existing = await Customer.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Customer with this phone number already exists" });
    }

    const customer = await Customer.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      notes,
    });

    await ActivityLog.create({
      user: req.user?.id,
      action: `Created customer: ${customer.name} (${customer.phone})`,
      category: "settings",
      details: { customerId: customer._id },
    });

    return res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update customer
export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, notes, loyaltyPoints } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    if (name) customer.name = name.trim();
    if (phone) customer.phone = phone.trim();
    if (email !== undefined) customer.email = email.trim();
    if (notes !== undefined) customer.notes = notes;
    if (loyaltyPoints !== undefined) customer.loyaltyPoints = Number(loyaltyPoints);

    await customer.save();

    return res.json({ success: true, data: customer });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete customer
export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    return res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Adjust loyalty points manually
export const adjustLoyaltyPoints = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { points, reason } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const delta = Number(points);
    customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints + delta);
    await customer.save();

    const transaction = await LoyaltyTransaction.create({
      customer: customer._id,
      points: delta,
      type: "adjusted",
      description: reason || "Manual staff adjustment",
    });

    return res.json({
      success: true,
      data: { customer, transaction },
      message: `Loyalty points adjusted by ${delta > 0 ? `+${delta}` : delta}`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
