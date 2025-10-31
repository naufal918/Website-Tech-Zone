// client/src/pages/ProdukList.jsx
import React, { useEffect, useState } from "react";
import API from "../api";
import { io } from "socket.io-client";

export default function ProdukList() {
  const [products, setProducts] = useState([]);

  const getProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Gagal ambil produk:", err);
    }
  };

  useEffect(() => {
    getProducts();
    const socket = io("http://localhost:5000"); // hubungkan ke backend

    // kalau ada perubahan produk, refresh data
    socket.on("productUpdate", () => {
      console.log("🔄 Produk diupdate, ambil ulang data...");
      getProducts();
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        💻 Daftar Produk
      </h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-gray-50 border rounded-xl shadow hover:shadow-lg p-4"
          >
            <img
              src={`http://localhost:5000${p.imageUrl}`}
              alt={p.name}
              className="rounded-lg w-full h-48 object-cover"
            />
            <h2 className="text-lg font-semibold mt-2">{p.name}</h2>
            <p className="text-gray-600">{p.description}</p>
            <p className="text-blue-600 font-bold mt-2">
              Rp {p.price.toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
