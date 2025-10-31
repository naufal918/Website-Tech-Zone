import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/admin/login", { email, password });
      localStorage.setItem("admin_token", res.data.token); // ✅ HARUS admin_token
      alert("Login berhasil!");
      nav("/products");
    } catch (err) {
      alert("Email atau password salah!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-800 px-4">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-8 w-full max-w-md">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-2 drop-shadow-sm">
          🧠 Admin Panel — <span className="text-cyan-500">TechZone</span>
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Masuk sebagai admin untuk mengelola produk dan pesanan ⚙️
        </p>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5"> {/* ✅ ganti di sini */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email Admin
            </label>
            <input
              type="email"
              placeholder="admin@email.com"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Masukkan password admin"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-transform hover:scale-105 hover:shadow-blue-300/50"
          >
            🔐 Masuk Dashboard
          </button>
        </form>

        {/* Info */}
        <p className="text-center text-xs text-gray-400 mt-8">
          © 2025 TechZone — Sistem Manajemen Admin 💼
        </p>
      </div>
    </div>
  );
}
