import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRouteAdmin({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    alert("⚠️ Akses di tolak, Khusus Admin!!");
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") {
    alert("🚫 Akses ditolak! Halaman ini hanya untuk admin.");
    return <Navigate to="/" replace />;
  }

  return children;
}
