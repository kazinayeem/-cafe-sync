import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

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
    await SettingModel.create({
      ...defaultSettings,
      businessName: "BornoCafe Specialty Coffee",
      address: "Sector 11, Uttara, Dhaka • Mirpur 12, Dhaka",
      phone: "+880 1711-223344",
      email: "contact@bornocafe.com",
      website: "http://52.66.113.169:5000",
      receiptFooter: "Thank you for visiting BornoCafe! Enjoy your freshly brewed specialty coffee.",
    });

    // 2. Users (Admin + Staff)
    console.log("👥 Seeding Users...");
    await User.deleteMany({});
    const defaultPasswordHash = await bcrypt.hash("12345", 10);

    await User.create({
      name: "Admin Officer",
      email: "admin@gmail.com",
      role: "admin",
      passwordHash: defaultPasswordHash,
      active: true,
      permissions: defaultSettings.permissions?.admin || [],
    });

    await User.create({
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
        { name: "Coconut Milk", price: 50 },
      ],
    });

    const syrupGroup = await ModifierGroup.create({
      name: "Flavor & Syrups",
      required: false,
      multiSelect: true,
      options: [
        { name: "Vanilla Syrup", price: 30 },
        { name: "Caramel Drizzle", price: 30 },
        { name: "Hazelnut Syrup", price: 35 },
        { name: "Salted Caramel", price: 35 },
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

    const catEspresso = await Category.create({ name: "Hot Coffee & Espresso" });
    const catCold = await Category.create({ name: "Cold Brews & Iced" });
    const catTea = await Category.create({ name: "Artisan Teas & Lattes" });
    const catBakery = await Category.create({ name: "Bakery & Sandwiches" });
    const catDesserts = await Category.create({ name: "Signature Desserts" });

    // 5. Products
    console.log("☕ Seeding Specialty Coffee Products...");
    await Product.deleteMany({});

    const products = [
      // Hot Coffee
      {
        name: "Spanish Latte",
        category: catEspresso._id,
        description: "Signature espresso layered with sweet condensed milk and silky textured steamed milk.",
        imageUrl: "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 150,
        minStockLevel: 15,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 220, large: 280, extraLarge: 340 },
        modifierGroups: [milkGroup._id, syrupGroup._id, shotGroup._id],
      },
      {
        name: "Velvet Flat White",
        category: catEspresso._id,
        description: "Double ristretto espresso shots blended with velvety microfoam.",
        imageUrl: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 180,
        minStockLevel: 20,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 200, large: 250, extraLarge: 300 },
        modifierGroups: [milkGroup._id, shotGroup._id],
      },
      {
        name: "Classic Cappuccino",
        category: catEspresso._id,
        description: "Rich espresso topped with equal parts steamed milk and thick foam dusted with dark cocoa.",
        imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop",
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
        description: "Freshly steamed milk marked with vanilla syrup, double espresso, and rich buttery caramel drizzle.",
        imageUrl: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 120,
        minStockLevel: 15,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 240, large: 300, extraLarge: 360 },
        modifierGroups: [milkGroup._id, syrupGroup._id],
      },
      {
        name: "Caffè Americano",
        category: catEspresso._id,
        description: "Fresh specialty espresso poured over hot purified water for a clean, nuanced brew.",
        imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 250,
        minStockLevel: 25,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 150, large: 190, extraLarge: 230 },
        modifierGroups: [shotGroup._id],
      },

      // Cold Brew & Iced
      {
        name: "Nitro Cold Brew",
        category: catCold._id,
        description: "16-hour slow-steeped cold brew infused with nitrogen for a naturally sweet, cascading creamy texture.",
        imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop",
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
        category: catCold._id,
        description: "Full-bodied espresso served over ice, chilled fresh milk, and Madagascar vanilla bean syrup.",
        imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 140,
        minStockLevel: 15,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 210, large: 270, extraLarge: 330 },
        modifierGroups: [milkGroup._id, syrupGroup._id],
      },
      {
        name: "Iced Hazelnut Mocha",
        category: catCold._id,
        description: "Belgian chocolate ganache, double espresso, hazelnut notes, and chilled milk over ice.",
        imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 100,
        minStockLevel: 10,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 260, large: 320, extraLarge: 380 },
        modifierGroups: [milkGroup._id, syrupGroup._id],
      },

      // Teas
      {
        name: "Spiced Masala Chai Latte",
        category: catTea._id,
        description: "Authentic Sreemangal tea brewed with cinnamon, cardamom, cloves, and steamed oat milk.",
        imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 90,
        minStockLevel: 10,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 180, large: 230 },
        modifierGroups: [milkGroup._id],
      },
      {
        name: "Ceremonial Matcha Latte",
        category: catTea._id,
        description: "First-harvest Uji Japanese green tea whisked with creamy steamed milk.",
        imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 60,
        minStockLevel: 10,
        trackInventory: true,
        unit: "cup",
        sizes: { small: 280, large: 340 },
        modifierGroups: [milkGroup._id],
      },

      // Bakery & Food
      {
        name: "French Butter Croissant",
        category: catBakery._id,
        description: "Golden-brown artisanal pastry baked fresh daily with pure imported French butter.",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 50,
        minStockLevel: 10,
        trackInventory: true,
        unit: "pcs",
        sizes: { small: 150 },
      },
      {
        name: "Almond Frangipane Croissant",
        category: catBakery._id,
        description: "Double-baked butter croissant filled with rich almond cream and topped with toasted almond flakes.",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 35,
        minStockLevel: 5,
        trackInventory: true,
        unit: "pcs",
        sizes: { small: 220 },
      },
      {
        name: "Smoked Chicken Panini",
        category: catBakery._id,
        description: "Grilled sourdough panini with oak-smoked chicken breast, melted mozzarella, and basil pesto.",
        imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 30,
        minStockLevel: 5,
        trackInventory: true,
        unit: "pcs",
        sizes: { small: 320 },
      },

      // Desserts
      {
        name: "Basque Burnt Cheesecake",
        category: catDesserts._id,
        description: "Caramelized charred exterior with a rich, molten custard center.",
        imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 25,
        minStockLevel: 5,
        trackInventory: true,
        unit: "slice",
        sizes: { small: 280 },
      },
      {
        name: "Classic Italian Tiramisu",
        category: catDesserts._id,
        description: "Savoiardi ladyfingers dipped in freshly pulled espresso, layered with whipped mascarpone cream.",
        imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=800&auto=format&fit=crop",
        available: true,
        stockQuantity: 20,
        minStockLevel: 5,
        trackInventory: true,
        unit: "slice",
        sizes: { small: 320 },
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
    console.log("☁️  Cloudinary Cloud:  " + (process.env.CLOUDINARY_CLOUD_NAME || "configured"));
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
