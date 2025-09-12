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
