import { Navigate, Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import type { AppDispatch, RootState } from "./store";
import { login } from "./store/userSlice";

export default function ProtectedRoute() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!token) {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        dispatch(
          login({
            token: storedToken,
            ...(JSON.parse(storedUser) || {}),
          })
        );
      }
    }
  }, [dispatch, token]);

  const isLoggedIn = token || localStorage.getItem("token");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
