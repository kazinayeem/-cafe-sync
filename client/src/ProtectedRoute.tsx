import { Navigate, Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { AppDispatch, RootState } from "./store";
import { login, logout } from "./store/userSlice";
import { isTokenExpired } from "./utils/token";

export default function ProtectedRoute() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!token) {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser && !isTokenExpired(storedToken)) {
        dispatch(
          login({
            token: storedToken,
            ...(JSON.parse(storedUser) || {}),
          })
        );
      } else {
        dispatch(logout());
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, [dispatch, token]);

  const validToken =
    token && !isTokenExpired(token) ? token : localStorage.getItem("token");

  if (!validToken || isTokenExpired(validToken)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
