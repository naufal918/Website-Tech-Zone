import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    console.log("Tombol diklik ✅"); // cek apakah muncul di console
    try {
      await API.post("/auth/register", { name, email, password });
      alert("✅ Akun berhasil dibuat! Silakan login untuk melanjutkan.");
      nav("/login");
    } catch (err) {
      console.error("❌ Register gagal:", err);
      alert("Register gagal! Pastikan semua data terisi ⚠️");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-800 px-4">
      <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-8 w-full max-w-md">
        {/* Logo / Judul */}
        <h1 className="text-4xl font-extrabold text-center text-blue-600 mb-2 drop-shadow-sm">
          ⚙️ Daftar di <span className="text-cyan-500">TechZone</span>
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Buat akunmu dan mulai jelajahi dunia teknologi sekarang! 🚀
        </p>

        {/* Form Register */}
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Misal: Budi Setiawan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="contoh@email.com"
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
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-transform hover:scale-105 hover:shadow-blue-300/50"
          >
            🚀 Daftar Sekarang
          </button>
        </form>

        {/* Link ke Login */}
        <p className="text-center text-gray-600 mt-6 text-sm">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Masuk di sini
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          © 2025 TechZone — Platform Belanja Teknologi Modern ⚡
        </p>
      </div>
    </div>
  );
}
