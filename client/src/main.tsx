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
import DashboardHome from "./dashboard/DashboardHome";
import ProtectedRoute from "./ProtectedRoute";
import TableManager from "./components/TableManager";
import { Toaster } from "react-hot-toast";
import StaffManagement from "./dashboard/staff/StaffManagement";
import CategoryManagement from "./dashboard/category/CategoryManagement";
import ProductManagement from "./dashboard/product/ProductManagement";
import OrdersList from "./pages/OrderList";
import ProfilePage from "./pages/ProfilePage";
import SummaryManagement from "./pages/SummaryManagement";
import { SettingManagement } from "./pages/SettingManagement";
import MainNavbar from "./components/MainNavbar";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Provider store={store}>
        <BrowserRouter>
        <MainNavbar/>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<DashboardHome />} />
                <Route path="tables" element={<TableManager />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route path="orders" element={<OrdersList />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="menu" element={<ProductManagement />} />
                <Route path="reports" element={<SummaryManagement />} />
                <Route path="settings" element={<SettingManagement />} />
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
