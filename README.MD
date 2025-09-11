![Cafe POS Cover](./screenshorts/cover.png)



# ☕ Cafe POS System

A modern **Point of Sale (POS) system** for cafés, built with **MERN stack** and **TypeScript**, featuring **real-time order management**, dashboard reports, and role-based access.

---

## Table of Contents

- [Features](#features)
- [Roles](#roles)
- [Database Schema](#database-schema)
- [UI Flow](#ui-flow)
- [Real-Time Functionality](#real-time-functionality)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 👥 Roles

### Admin (Owner / Super Admin)
- Register shops
- Manage baristas & cashiers
- Approve menu items
- Add categories & subcategories
- Add/edit menu items
- Manage tables
- View reports (daily/monthly sales, barista performance, cashier performance)

### Barista
- Can suggest new drinks (requires Admin approval)
- Prepares drinks for assigned orders

### Cashier
- Takes customer orders (table number or takeaway)
- Adds items from categories/subcategories
- Prints bills / confirms payment

---

## 📦 Features

1. **Menu with Categories & Subcategories**
   - Example:
     - Coffee → Cappuccino, Latte, Mocha
     - Tea → Milk Tea, Ginger Tea
     - Snacks → Cake, Croissant
   - Each subcategory has items with **sizes (S/M/L)** and **price**

2. **Order Flow**
   - Cashier creates order (assigns to table or takeaway)
   - Barista sees new orders instantly
   - Admin monitors order status and sales

3. **Dashboard / Reports**
   - Daily / Monthly sales overview
   - Top-selling categories/items
   - Barista & Cashier performance metrics

---

## 🗂️ Database Schema

### Users

```ts
{
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "barista" | "cashier";
  shopId: string;
  createdAt: Date;
}











# Clone the repository
git clone https://github.com/yourusername/cafe-pos-system.git
cd cafe-pos-system

# Install dependencies (frontend)
cd client
npm install

# Install dependencies (backend)
cd ../server
npm install

# Run the backend server
npm run dev

# Run the frontend
cd ../client
npm run dev


---

I can also create a **more visual README** with **badges, GIF demo, and folder structure** to make it look professional for GitHub.  

Do you want me to do that next?
