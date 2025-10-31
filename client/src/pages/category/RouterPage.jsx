import React, { useEffect, useState } from "react";
import axios from "axios";
import { Laptop } from "lucide-react"; // ikon laptop biar rapi

export default function VGAPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/products/category/router");
        const sorted = res.data.sort((a, b) => b.price - a.price);
        console.log("Data produk vga:", res.data);
        setProducts(sorted);
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 🔹 Fungsi Tambah ke Keranjang
  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!userId || !token) {
        alert("Silakan login terlebih dahulu sebelum menambahkan ke keranjang!");
        return;
      }

      console.log("🛒 Menambahkan produk:", product);

      const res = await axios.post(
        "http://localhost:5000/cart",
        {
          user_id: userId,
          product_id: product.id, // pastikan 'id' sama dengan kolom di DB
          quantity: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(res.data.message || `${product.name} berhasil ditambahkan ke keranjang!`);
    } catch (error) {
      console.error("❌ Gagal menambahkan ke keranjang:", error.response || error);
      alert("Gagal menambahkan produk ke keranjang!");
    }
  };

  return (
    <div className="p-6">
      {/* Header kategori */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        <Laptop className="w-7 h-7 text-blue-600" />
        <h2 className="text-3xl font-bold text-black-600">VGA</h2>
      </div>

      {/* Loading state */}
      {loading && <p className="text-gray-500 text-center text-lg">Memuat produk...</p>}

      {/* Jika kosong */}
      {!loading && products.length === 0 && (
        <p className="text-gray-500 text-center text-lg">
          Belum ada produk di kategori ini 😢
        </p>
      )}

      {/* Grid produk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
          >
            {/* Gambar produk */}
            {item.imageUrl ? (
              <img
                src={`http://localhost:5000${item.imageUrl}`}
                alt={item.name}
                className="w-full max-h-60 object-contain rounded-lg mb-3"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                Tidak ada gambar
              </div>
            )}

            {/* Info produk */}
            <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
            <p className="text-gray-600 text-sm flex-1 mt-1">{item.description}</p>

            {/* Harga */}
            <p className="text-blue-600 font-bold mt-3">
              Rp {Number(item.price).toLocaleString("id-ID")}
            </p>

            {/* 🔹 Tombol yang berfungsi */}
            <button
              onClick={() => handleAddToCart(item)}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              Tambah ke Keranjang 🛒
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
