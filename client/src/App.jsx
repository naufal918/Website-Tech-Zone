import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, MapPin, User, LogOut, LayoutDashboard } from "lucide-react";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Cart from "./pages/cart";
import Products from "./pages/products";
import AdminProdukList from "./pages/produkList";
import Profile from "./pages/profile";
import ProfileView from "./pages/profileView";
import CategoryPage from "./pages/CategoryPage";
import LaptopPage from "./pages/category/LaptopPage";
import VGAPage from "./pages/category/VGAPage";
import Checkout from "./pages/checkout";
import PaymentPage from "./pages/payment";
import ProtectedRouteAdmin from "./components/ProtectedRouteAdmin";
import SuccessPage from "./pages/SuccessPage.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden w-full max-w-full">
        {/* Navbar di atas */}
        <Navbar />

        {/* Konten utama */}
        <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/products"
              element={
                <ProtectedRouteAdmin>
                  <Products />
                </ProtectedRouteAdmin>
              }
            />
            {/* ini login admin */}
            <Route path="/produkList" element={<AdminProdukList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/View" element={<ProfileView />} />
            <Route path="/category/:categoryName" element={<CategoryPage />} />
            <Route path="/category/laptop" element={<LaptopPage />} />
            <Route path="/category/vga" element={<VGAPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/orders-history" element={<OrderHistory />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white mt-10 border-t py-4 text-center text-sm text-gray-500">
          © 2025 TechZone — by Naufal Abdullah H.W
        </footer>
      </div>
    </BrowserRouter>
  );
}


/* ---------------------- NAVBAR ---------------------- */
/* ---------------------- NAVBAR ---------------------- */
function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const name =
    localStorage.getItem("name") || (role === "admin" ? "Admin" : "User");

  const handleLogout = () => {
    localStorage.clear();
    setDropdownOpen(false);
    navigate("/login");
  };

  // tutup dropdown user & hasil search jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔍 fungsi pencarian
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/products/search?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();

      console.log("🔍 Data hasil:", data.results);
      setSearchResults(data.results || []);
      setShowResults(true);
    } catch (err) {
      console.error("❌ Gagal mencari produk:", err);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        {/* 🪪 Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="text-2xl sm:text-3xl font-bold text-sky-600">
            tech<span className="text-gray-800">zone</span>
          </Link>
        </div>

        {/* ☰ Tombol menu (mobile) */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* 🌐 Menu utama */}
        <div
          className={`flex-col md:flex md:flex-row md:items-center md:gap-6 absolute md:static bg-white md:bg-transparent top-14 left-0 w-full md:w-auto p-4 md:p-0 shadow-md md:shadow-none transition-all duration-300 ${
            menuOpen ? "block" : "hidden md:flex"
          }`}
        >
          {/* 📂 Kategori */}
          <button className="text-gray-700 font-medium hover:text-sky-600 mb-2 md:mb-0">
            Kategori
          </button>

          {/* 🔍 Search Bar */}
          <div
            ref={searchRef}
            className="relative flex flex-col w-full md:w-72 mb-3 md:mb-0"
          >
            <form onSubmit={handleSearch} className="flex w-full">
              <input
                type="text"
                placeholder="Cari di TechZone"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none text-sm placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-sky-600 text-white px-3 py-2 hover:bg-sky-700 transition rounded-r-lg flex items-center justify-center"
                title="Cari produk"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </button>
            </form>

            {/* 🔽 Dropdown hasil pencarian */}
            {showResults && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setShowResults(false);
                        setSearchQuery("");
                        navigate(`/product/${item.id}`);
                      }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-sky-50 cursor-pointer transition-colors"
                    >
                      {item.imageUrl && (
                        <img
                          src={`http://localhost:5000${item.imageUrl}`}
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded-md border border-gray-100"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800 line-clamp-1">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Rp {item.price?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-3 text-sm text-gray-500 text-center">
                    Tidak ada hasil ditemukan
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 🛒 Cart Icon */}
          <Link
            to="/cart"
            className="text-gray-700 hover:text-sky-600 text-xl md:ml-3 mb-2 md:mb-0 flex items-center gap-1"
            title="Keranjang Belanja"
          >
            <ShoppingCart className="w-5 h-5" />
          </Link>

          {/* 👤 User Menu */}
          {!token ? (
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Link
                to="/login"
                className="border border-sky-600 text-sky-600 px-4 py-1.5 rounded-md font-medium hover:bg-sky-50 transition"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-sky-600 text-white px-4 py-1.5 rounded-md font-medium hover:bg-sky-700 transition"
              >
                Daftar
              </Link>
            </div>
          ) : (
            <div
              ref={dropdownRef}
              className="relative flex flex-col md:flex-row items-start md:items-center gap-3"
            >
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-gray-700 hover:text-sky-600 focus:outline-none"
              >
                <User className="w-5 h-5" />
                <span className="capitalize">{name}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-10 bg-white border rounded-lg shadow-lg py-2 w-48">
                  <ul className="text-sm text-gray-700">
                    {role === "admin" && (
                      <>
                        <li
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/produkList");
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </li>
                        <li
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate("/products");
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          Tambah Barang
                        </li>
                      </>
                    )}
                    {role !== "admin" && (
                      <li
                        onClick={() => {
                          setDropdownOpen(false);
                          navigate("/profile");
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Profil
                      </li>
                    )}
                    <li
                      onClick={handleLogout}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Keluar
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 📍 Lokasi */}
      <div className="border-t text-sm text-gray-600 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          Dikirim ke <span className="font-medium">Jawa Barat</span>
        </div>
      </div>
    </header>
  );
}
