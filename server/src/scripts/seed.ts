import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import crypto from "crypto";

import { User } from "../models/User";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { ModifierGroup } from "../models/ModifierGroup";
import { Table } from "../models/Table";
import { Customer } from "../models/Customer";
import { SettingModel, defaultSettings } from "../models/Settings";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

export const seedDatabase = async () => {
  try {
    console.log("🔌 Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB.");

    // 1. Settings
    console.log("⚙️  Seeding Settings...");
    await SettingModel.deleteMany({});
    await SettingModel.create(defaultSettings);

    // 2. Users (Admin + Staff)
    console.log("👥 Seeding Users...");
    await User.deleteMany({});
    const defaultPasswordHash = await bcrypt.hash("12345", 10);

    const adminUser = await User.create({
      name: "Admin Officer",
      email: "admin@gmail.com",
      role: "admin",
      passwordHash: defaultPasswordHash,
      active: true,
      permissions: defaultSettings.permissions?.admin || [],
    });

    const staffUser = await User.create({
      name: "Kazi Nayeem",
      email: "kazinayeem@gmail.com",
      role: "cashier",
      passwordHash: defaultPasswordHash,
      active: true,
      permissions: defaultSettings.permissions?.cashier || [],
    });

    // 3. Modifier Groups
    console.log("🥛 Seeding Modifiers...");
    await ModifierGroup.deleteMany({});

    const milkGroup = await ModifierGroup.create({
      name: "Milk Selection",
      required: false,
      multiSelect: false,
      options: [
        { name: "Whole Milk", price: 0 },
        { name: "Oat Milk", price: 50 },
        { name: "Almond Milk", price: 60 },
        { name: "Soy Milk", price: 40 },
      ],
    });

    const syrupGroup = await ModifierGroup.create({
      name: "Syrup Add-ons",
      required: false,
      multiSelect: true,
      options: [
        { name: "Vanilla Syrup", price: 30 },
        { name: "Caramel Drizzle", price: 30 },
        { name: "Hazelnut Syrup", price: 35 },
      ],
    });

    const shotGroup = await ModifierGroup.create({
      name: "Espresso Shots",
      required: false,
      multiSelect: false,
      options: [
        { name: "Single Shot", price: 40 },
        { name: "Double Shot (Extra)", price: 70 },
      ],
    });

    // 4. Categories
    console.log("📂 Seeding Categories...");
    await Category.deleteMany({});

    const catEspresso = await Category.create({ name: "Specialty Espresso" });
    const catColdBrew = await Category.create({ name: "Cold Brews & Iced" });
    const catBakery = await Category.create({ name: "Artisan Bakery" });
    const catDesserts = await Category.create({ name: "Signature Desserts" });

    // 5. Products
    console.log("☕ Seeding Products...");
    await Product.deleteMany({});

    const products = [
      {
        name: "Spanish Latte",
        category: catEspresso._id,
        description: "Espresso with condensed milk and silky textured steamed milk.",
        imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop",
        available: true,
        stockQuantity: 150,
        minStockLevel: 15,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 220, large: 280, extraLarge: 340 },
        modifierGroups: [milkGroup._id, syrupGroup._id, shotGroup._id],
      },
      {
        name: "Classic Cappuccino",
        category: catEspresso._id,
        description: "Equal parts double espresso, velvety steamed milk, and rich microfoam dusted with cocoa.",
        imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=600&auto=format&fit=crop",
        available: true,
        stockQuantity: 200,
        minStockLevel: 20,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 180, large: 240, extraLarge: 290 },
        modifierGroups: [milkGroup._id, shotGroup._id],
      },
      {
        name: "Caramel Macchiato",
        category: catEspresso._id,
        description: "Freshly steamed milk with vanilla-flavored syrup marked with espresso and caramel drizzle.",
        imageUrl: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=600&auto=format&fit=crop",
        available: true,
        stockQuantity: 120,
        minStockLevel: 15,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 240, large: 300, extraLarge: 360 },
        modifierGroups: [milkGroup._id, syrupGroup._id],
      },
      {
        name: "Nitro Cold Brew",
        category: catColdBrew._id,
        description: "Slow-steeped cold brew infused with nitrogen for a naturally sweet, cascading creamy texture.",
        imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=600&auto=format&fit=crop",
        available: true,
        stockQuantity: 80,
        minStockLevel: 10,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 250, large: 320 },
        modifierGroups: [syrupGroup._id],
      },
      {
        name: "Iced Vanilla Latte",
        category: catColdBrew._id,
        description: "Full-bodied espresso served over ice, chilled milk, and premium Madagascar vanilla syrup.",
        imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=600&auto=format&fit=crop",
        available: true,
        stockQuantity: 140,
        minStockLevel: 15,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 210, large: 270, extraLarge: 330 },
        modifierGroups: [milkGroup._id, syrupGroup._id],
      },
      {
        name: "French Butter Croissant",
        category: catBakery._id,
        description: "Flaky, golden-brown artisanal pastry baked fresh daily with pure French butter.",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop",
        available: true,
        stockQuantity: 40,
        minStockLevel: 5,
        trackInventory: true,
        unit: "pcs",
        sizes: { small: 120 },
      },
      {
        name: "Basque Burnt Cheesecake",
        category: catDesserts._id,
        description: "Caramelized crust on the outside with an ultra-creamy, molten custard center.",
        imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=600&auto=format&fit=crop",
        available: true,
        stockQuantity: 25,
        minStockLevel: 5,
        trackInventory: true,
        unit: "slice",
        sizes: { small: 280 },
      },
    ];

    for (const prod of products) {
      const created = await Product.create(prod);
      await Category.findByIdAndUpdate(prod.category, {
        $push: { items: created._id },
      });
    }

    // 6. Tables
    console.log("🪑 Seeding Tables & QR Tokens...");
    await Table.deleteMany({});

    const tableData = [
      { name: "Table 01", seats: 2, section: "Main Hall", shape: "square", posX: 100, posY: 100, qrToken: "tbl_01_main" },
      { name: "Table 02", seats: 4, section: "Main Hall", shape: "square", posX: 260, posY: 100, qrToken: "tbl_02_main" },
      { name: "Table 03", seats: 4, section: "Window View", shape: "rectangle", posX: 420, posY: 100, qrToken: "tbl_03_win" },
      { name: "Table 04", seats: 6, section: "Lounge Area", shape: "round", posX: 100, posY: 260, qrToken: "tbl_04_lng" },
      { name: "Table 05", seats: 4, section: "Balcony", shape: "square", posX: 260, posY: 260, qrToken: "tbl_05_bal" },
    ];

    for (const tbl of tableData) {
      await Table.create(tbl);
    }

    // 7. Demo Customers
    console.log("👤 Seeding CRM Customers...");
    await Customer.deleteMany({});

    await Customer.create([
      { name: "Tamim Iqbal", phone: "01711000111", email: "tamim@example.com", loyaltyPoints: 240, totalSpent: 2850 },
      { name: "Sakib Al Hasan", phone: "01811000222", email: "sakib@example.com", loyaltyPoints: 450, totalSpent: 5200 },
      { name: "Mushfiqur Rahim", phone: "01911000333", email: "mushfiq@example.com", loyaltyPoints: 120, totalSpent: 1400 },
    ]);

    console.log("✨ Seeding completed successfully!");
    console.log("------------------------------------------");
    console.log("🔐 Demo Admin Login:  admin@gmail.com / 12345");
    console.log("🔐 Demo Staff Login:  kazinayeem@gmail.com / 12345");
    console.log("------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}
