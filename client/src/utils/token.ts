import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  role: string;
  email?: string;
  exp: number; 
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) return true;
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch {
    return true; 
  }
};
