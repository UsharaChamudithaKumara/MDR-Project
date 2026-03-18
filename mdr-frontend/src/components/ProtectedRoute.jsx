import React from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/AuthService";

const ProtectedRoute = ({ children, roles }) => {
  const user = AuthService.getCurrentUser();
  const token = AuthService.getToken();

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
