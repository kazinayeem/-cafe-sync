export type UserRole =
  | "admin"
  | "staff"
  | "customer"
  | "cashier"
  | "manager"
  | "barista";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserInput {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  password?: string;
}
export interface IStaffResponse {
  success: boolean;
  message?: string;
  staffs: IUser[];
}

export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
export interface Product {
  _id: string;
  name: string;
  imageUrl: string;
  sizes: Record<string, number>;
}

export interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  size: string;
  price: number;
}

export interface Table {
  _id: string;
  name: string;
  status: string;
}

export interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  paymentMethod: string;
  table?: Table | null;
  createdAt: string;
}

export interface OrdersResponse {
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface StatusBreakdown {
  _id: string;
  count: number;
  sales: number;
}

export interface SalesSummaryResponse {
  success: boolean;
  filter: string;
  range: { start: string; end: string };
  summary: { totalOrders: number; totalSales: number };
  statusBreakdown: StatusBreakdown[];
  orders: Order[];
  allData: Record<string, Order[]>; // group orders by status
}

export interface IBusinessSettings {
  // 🧾 Finance
  taxRate: number;
  discountRate: number;
  currency: string;
  serviceCharge?: number;

  // 🏢 Business Info
  businessName: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;

  // 🖨️ Printing
  receiptFooter?: string;
  logoUrl?: string;
  showTableName?: boolean;

  // ⚙️ POS Behavior
  enableDiscountInput: boolean;
  enableTaxOverride: boolean;
  allowNegativeStock: boolean;

  // 🕒 Shifts & Timing
  openingTime?: string; // e.g. "09:00"
  closingTime?: string; // e.g. "23:00"
  offDays?: string[]; // e.g. ["Friday"]

  // 📊 Reports
  lowStockAlertLevel?: number;
  salesTarget?: number;

  updatedAt?: Date;
}
