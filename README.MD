# ☕ Cafe POS System

|                  **Application Cover**                  |     |
| :-----------------------------------------------------: | :-: |
| ![Main application cover image](screenshorts/cover.png) |     |

A modern **Point of Sale (POS) system** for cafés, built with the **MERN stack** and **TypeScript**. This application is designed to streamline cafe operations, offering features like **real-time order management**, detailed dashboard reports, and role-based access to ensure a smooth workflow for all staff.

---

## ✨ Features

- **Real-Time Order Management**: Baristas and cashiers see new orders and status updates instantly, improving communication and service speed.
- **Role-Based Access**: The system differentiates between roles (Admin, Barista, Cashier), granting specific permissions to each user type.
- **Menu & Inventory Management**: Admins can easily add, edit, and delete menu items, categories, and subcategories. They can also manage product availability.
- **Customizable Menu**: Menu items can be organized into categories and subcategories (e.g., Coffee, Tea, Snacks) with support for different sizes and prices.
- **Table & Order Status**: Track the real-time status of tables (occupied, available) and orders (pending, in progress, complete).
- **Comprehensive Reports**: The admin dashboard provides a summary of key metrics, including daily and monthly sales, top-selling items, and staff performance.
- **PDF Generation**: Generate printable sales summaries and order receipts for easy record-keeping and customer convenience.
- **Payment & Discount Management**: Process payments using various methods (e.g., cash, card, mobile wallets) and apply discounts or coupons to orders.
- **Customer Loyalty**: Create and manage customer profiles to track purchase history and offer rewards through a loyalty program.
- **Search & Filtering**: Quickly find orders or products using a search bar and filter reports by date.
- **Staff Management**: Admins can add new staff members and assign roles. They can also activate or deactivate staff accounts as needed.
- **Intuitive UI**: A clean, responsive user interface makes it easy for cashiers to take orders and for staff to navigate the system.
- **Printer Support**: Support for printing kitchen tickets and customer receipts.

---

## 👥 Roles

The application supports three distinct user roles, each with specific permissions to handle their responsibilities efficiently.

### Admin (Owner / Super Admin)

- **User Management**: Add, edit, and manage all staff accounts, assigning them specific roles (Barista, Cashier).
- **Menu Control**: Add, edit, and delete menu items, categories, and subcategories. Manage product availability.
- **Operations Oversight**: View real-time order status and table occupancy.
- **Analytics & Reports**: Access detailed reports on daily/monthly sales, product performance, and staff metrics.

### Barista

- **Order Fulfillment**: View new orders in real time.
- **Status Updates**: Update the status of assigned orders as they are prepared.
- **Menu Suggestions**: Can suggest new menu items for admin approval.

### Cashier

- **Order Creation**: Create new orders, assign them to a table or as a takeaway.
- **Customer Service**: Add items to the order, process payments, and apply discounts.
- **Receipts**: Print order receipts for customers.

---

## 🏗️ Tech Stack

This project is built using a modern, scalable technology stack.

- **Frontend**: **React**, **TypeScript**, **Redux** (for state management), **Vite** (for a fast development environment), **Tailwind CSS** (for styling), and **Lucide React** (for icons).
- **Backend**: **Node.js**, **Express.js**, **TypeScript**.
- **Database**: **MongoDB** (using **Mongoose** for object data modeling).
- **Real-time Communication**: **Socket.io** (for instant updates on orders and tables).
- **Authentication**: **JWT (JSON Web Tokens)**.

---

## 🚀 Installation

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud-based)

### Backend Setup

1.  Clone the repository:
        `bash
    git clone [https://github.com/your-username/cafe-pos.git](https://github.com/your-username/cafe-pos.git)
    cd cafe-pos/backend
    `
2.  Install dependencies:
        `bash
    npm install
    `
3.  Create a `.env` file in the `backend` directory and add your environment variables:
        `    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    PORT=5000
   `
4.  Run the server:
        `bash
    npm run dev
    `

### Frontend Setup

1.  Navigate to the frontend directory:
        `bash
    cd ../frontend
    `
2.  Install dependencies:
        `bash
    npm install
    `
3.  Run the client:
        `bash
    npm run dev
    `

The application should now be running on `http://localhost:5173` (or the port specified in your Vite config).

---

### 📄 Sample Receipt

<div align="center">
  <a href="screenshorts/demo-print.pdf" target="_blank">
    <img src="https://img.shields.io/badge/View%20Sample%20Receipt-red?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white" alt="View Sample Receipt" />
  </a>
</div>
## 📸 Screenshots

A visual walkthrough of the Cafe POS System's key features and user interface.

|               **Dashboard & Sales Overview**               |                       **Real-Time Orders**                        |
| :--------------------------------------------------------: | :---------------------------------------------------------------: |
| ![Dashboard showing sales charts](screenshorts/image1.png) | ![Live order tracking view for baristas](screenshorts/image2.png) |

|                    **Table Management**                     |                        **Order Creation**                         |
| :---------------------------------------------------------: | :---------------------------------------------------------------: |
| ![Table status and occupancy view](screenshorts/image3.png) | ![Cashier's interface for taking orders](screenshorts/image4.png) |

|                         **Menu Management**                          |                         **Category Setup**                          |
| :------------------------------------------------------------------: | :-----------------------------------------------------------------: |
| ![Admin view for adding/editing menu items](screenshorts/image5.png) | ![Admin interface for managing categories](screenshorts/image6.png) |

|                        **Staff Management**                        |                       **Reports & Analytics**                        |
| :----------------------------------------------------------------: | :------------------------------------------------------------------: |
| ![Admin view for managing staff accounts](screenshorts/image7.png) | ![Detailed sales reports with date filters](screenshorts/image8.png) |

|                      **Search Functionality**                      |                           **Staff Permissions View**                           |
| :----------------------------------------------------------------: | :----------------------------------------------------------------------------: |
| ![Searching for specific items or orders](screenshorts/image9.png) | ![Admin's view of a staff member's details and role](screenshorts/image10.png) |

|                  **Product Availability Toggles**                  |                         **Detailed Order View**                         |
| :----------------------------------------------------------------: | :---------------------------------------------------------------------: |
| ![Admin toggling an item's availability](screenshorts/image11.png) | ![A detailed view of a single customer order](screenshorts/image12.png) |

|                     **Order Confirmation**                     |                   **PDF Receipt Generation**                    |
| :------------------------------------------------------------: | :-------------------------------------------------------------: |
| ![Screen showing order confirmation](screenshorts/image13.png) | ![Example of a generated PDF receipt](screenshorts/image14.png) |

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue. For major changes, please fork the repository and create a pull request.

---

## 📄 License

This project is licensed under the MIT License.
