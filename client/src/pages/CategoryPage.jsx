import React, { useEffect, useState } from "react";
import axios from "axios";
import { Laptop, Gpu, Router, Keyboard } from "lucide-react";
import { useParams } from "react-router-dom";

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const categoryIcons = {
    laptop: <Laptop className="w-7 h-7 text-blue-600" />,
    vga: <Gpu className="w-7 h-7 text-blue-600" />,
    router: <Router className="w-7 h-7 text-blue-600" />,
    aksesoris: <Keyboard className="w-7 h-7 text-blue-600" />,
  };

  const displayName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/products/category/${categoryName}`
        );
        setProducts(res.data.sort((a, b) => b.price - a.price));
      } catch (error) {
        console.error("Gagal mengambil data produk:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  // 🛒 Tambah ke keranjang (ke backend)
  const handleAddToCart = async (product) => {
    if (!token || !userId) {
      alert("Silakan login terlebih dahulu untuk menambahkan ke keranjang.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/cart",
        {
          user_id: userId,
          product_id: product.id,
          quantity: 1,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Produk ditambahkan ke keranjang:", res.data);
      alert(`${product.name} berhasil ditambahkan ke keranjang 🛒`);
    } catch (err) {
      console.error("Gagal menambahkan ke keranjang:", err);
      alert("Gagal menambahkan ke keranjang!");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        {categoryIcons[categoryName] || (
          <Laptop className="w-7 h-7 text-blue-600" />
        )}
        <h2 className="text-3xl font-bold text-blue-600">{displayName}</h2>
      </div>

      {loading && (
        <p className="text-gray-500 text-center text-lg">Memuat produk...</p>
      )}

      {!loading && products.length === 0 && (
        <p className="text-gray-500 text-center text-lg">
          Belum ada produk di kategori ini 😢
        </p>
      )}

      {/* Grid Produk */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
          >
            {item.imageUrl ? (
              <img
                src={`http://localhost:5000${item.imageUrl}`}
                alt={item.name}
                className="w-full h-48 object-contain bg-white rounded-lg mb-3"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
                Tidak ada gambar
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
            <p className="text-gray-600 text-sm flex-1 mt-1">
              {item.description}
            </p>
            <p className="text-blue-600 font-bold mt-3">
              Rp {Number(item.price).toLocaleString("id-ID")}
            </p>

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
