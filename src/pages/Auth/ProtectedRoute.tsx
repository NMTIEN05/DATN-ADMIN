import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ allowedRoles, children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  let user = null;
  try {
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    user = null;
  }

  // ✅ Nếu không có token hoặc user → redirect login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Nếu role không hợp lệ → chuyển đến unauthorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
