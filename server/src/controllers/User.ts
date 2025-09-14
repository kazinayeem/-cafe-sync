import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

// -------------------- Super Admin --------------------
export const createSuperAdmin = async (req: Request, res: Response) => {
  try {
    const email = "admin@gmail.com";
    const password = "12345";

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Super Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = new User({
      name: "Super Admin",
      email,
      role: "admin",
      passwordHash: hashedPassword,
      active: true,
    });

    await superAdmin.save();
    res.status(201).json({ message: "Super Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating super admin", error });
  }
};

// -------------------- Register User --------------------
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      role: role || "customer",
      passwordHash: hashedPassword,
      active: true,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration error", error });
  }
};

// -------------------- Login --------------------
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.active)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.passwordHash || "");
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error });
  }
};

// -------------------- Staff Management --------------------

// Get all staff
export const getStaffs = async (req: Request, res: Response) => {
  try {
    const staffs = await User.find({
      role: { $in: ["barista", "manager", "cashier"] },
    });
    res.json({ success: true, staffs });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching staff", error });
  }
};

// Add new staff
export const addStaff = async (req: Request, res: Response) => {
  try {
    const { name, email, password, position } = req.body;

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password || "12345", 10);

    const staff = new User({
      name,
      email,
      role: position.toLowerCase(), // barista, manager, cashier
      passwordHash: hashedPassword,
      active: true,
    });

    await staff.save();
    res.status(201).json({ success: true, staff });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error adding staff", error });
  }
};

// Update staff
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, position, active } = req.body;

    const updatedStaff = await User.findByIdAndUpdate(
      id,
      { name, email, role: position?.toLowerCase(), active },
      { new: true }
    );

    if (!updatedStaff)
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });

    res.json({ success: true, staff: updatedStaff });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error updating staff", error });
  }
};

// Delete staff
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedStaff = await User.findByIdAndDelete(id);
    if (!deletedStaff)
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });

    res.json({ success: true, message: "Staff deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting staff", error });
  }
};

// Toggle active/inactive
export const toggleStaffActive = async (req: Request, res: Response) => {
  try {
    console.log("Toggle staff active called");
    const { id } = req.params;

    const staff = await User.findById(id);
    if (!staff)
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });

    staff.active = !staff.active;
    await staff.save();

    res.json({ success: true, staff });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error toggling staff status", error });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, email, password } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};
