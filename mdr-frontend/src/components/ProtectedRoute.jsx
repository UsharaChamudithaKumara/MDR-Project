import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthService from "../services/AuthService";

const ProtectedRoute = ({ children, roles }) => {
  const user = AuthService.getCurrentUser();
  const token = AuthService.getToken();
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // Super admin must stay in /admin area
  if (user.role === "super_admin" && !location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin" replace />;
  }

  // Regular users/admins cannot access /admin area
  if (user.role !== "super_admin" && location.pathname.startsWith("/admin")) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

