// src/components/AuthProtectedRoute.tsx

import { Navigate, Outlet } from "react-router-dom";

const AuthProtectedRoute = () => {
  const token = localStorage.getItem("token");

  // Agar token nahi mila to redirect to login
  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  // Token mila, route allow karo
  return <Outlet />;
};

export default AuthProtectedRoute;
