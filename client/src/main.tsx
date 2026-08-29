import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import "./index.css";
import Login from "./pages/Login";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "./components/theme-provider";
import Dashboard from "./dashboard/Dashboard";
import MainPage from "./pages/MainPage";
import ProtectedRoute from "./ProtectedRoute";
import TableManager from "./components/TableManager";
import { Toaster } from "react-hot-toast";
import StaffManagement from "./dashboard/staff/StaffManagement";
import CategoryManagement from "./dashboard/category/CategoryManagement";
import ProductManagement from "./dashboard/product/ProductManagement";
import OrderList from "./pages/OrderList";
import ProfilePage from "./pages/ProfilePage";
import SummaryManagement from "./pages/SummaryManagement";
import SettingManagement from "./pages/SettingManagement";
import CustomerManagement from "./pages/CustomerManagement";
import InventoryManagement from "./pages/InventoryManagement";
import ModifierManagement from "./pages/ModifierManagement";
import ShiftManagement from "./pages/ShiftManagement";
import ReservationManagement from "./pages/ReservationManagement";
import KitchenDisplaySystem from "./pages/KDS";
import QRMenu from "./pages/QRMenu";
import CustomerOrderPage from "./pages/CustomerOrderPage";
import CustomerOrderTracking from "./pages/CustomerOrderTracking";
import CustomerDisplayScreen from "./pages/CustomerDisplayScreen";
import FindMyCoffee from "./pages/FindMyCoffee";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/menu" element={<QRMenu />} />
            <Route path="/qr-menu" element={<QRMenu />} />
            <Route path="/find-my-coffee" element={<FindMyCoffee />} />
            <Route path="/my-coffee" element={<FindMyCoffee />} />

            {/* Smart QR Ordering & Tracking (Public for customers at tables) */}
            <Route path="/order/:qrToken" element={<CustomerOrderPage />} />
            <Route path="/track/:orderId" element={<CustomerOrderTracking />} />

            {/* Public TV / Monitor Order Status Display */}
            <Route path="/display" element={<CustomerDisplayScreen />} />

            {/* Standalone KDS Screen */}
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute>
                  <KitchenDisplaySystem isStandalone />
                </ProtectedRoute>
              }
            />

            {/* Protected POS & Operations Dashboard */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<MainPage />} />
                <Route path="kitchen" element={<KitchenDisplaySystem />} />
                <Route path="orders" element={<OrderList />} />
                <Route path="tables" element={<TableManager />} />
                <Route path="reservations" element={<ReservationManagement />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="modifiers" element={<ModifierManagement />} />
                <Route path="shifts" element={<ShiftManagement />} />
                <Route path="menu" element={<ProductManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="reports" element={<SummaryManagement />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="settings" element={<SettingManagement />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-center" reverseOrder={false} />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>
);
