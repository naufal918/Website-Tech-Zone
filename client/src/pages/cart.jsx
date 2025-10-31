import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // 🔹 Ambil data keranjang
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(res.data);
      } catch (err) {
        console.error("Gagal ambil data cart:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userId && token) fetchCart();
  }, [userId, token]);

  // 🔹 Hapus item
  const handleRemove = async (id) => {
    if (!window.confirm("Hapus item ini dari keranjang?")) return;
    try {
      await axios.delete(`http://localhost:5000/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(cartItems.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Gagal hapus item:", err);
    }
  };

  // 🔹 Total harga
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // 🔹 Checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }
    navigate("/checkout", { state: { totalPrice, cartItems } });
  };

  // 🔹 Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-lg">
        ⏳ Memuat keranjang...
      </div>
    );
  }

  // 🔹 Kosong
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-600">
        <ShoppingCart size={64} className="mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold">Keranjangmu kosong</h2>
        <p>Yuk, tambahkan produk favoritmu!</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <ShoppingCart size={28} className="text-blue-600" /> Keranjang Belanja
      </h1>

      <div className="bg-white shadow-md rounded-xl p-4 md:p-6">
        {/* 🖥️ Tampilan Desktop */}
        <div className="hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-700">
                <th className="p-3">Produk</th>
                <th className="p-3 text-center">Harga</th>
                <th className="p-3 text-center">Jumlah</th>
                <th className="p-3 text-center">Subtotal</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="flex items-center gap-3 p-3">
                    <img
                      src={`http://localhost:5000${item.imageUrl}`}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />
                    <span className="font-medium">{item.name}</span>
                  </td>
                  <td className="text-center p-3">
                    Rp {item.price.toLocaleString("id-ID")}
                  </td>
                  <td className="text-center p-3">{item.quantity}</td>
                  <td className="text-center p-3 font-semibold text-blue-700">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </td>
                  <td className="text-center p-3">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📱 Tampilan Mobile */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-3 flex flex-col bg-white shadow-sm"
            >
              <div className="flex gap-3">
                <img
                  src={`http://localhost:5000${item.imageUrl}`}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Harga: Rp {item.price.toLocaleString("id-ID")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Jumlah: {item.quantity}
                  </p>
                  <p className="text-blue-700 font-semibold mt-1">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-600 hover:text-red-800 transition text-sm flex items-center gap-1"
                >
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 💰 Total & Checkout */}
        <div className="flex flex-col md:flex-row justify-end items-end md:items-center mt-6 gap-4">
          <p className="text-lg font-semibold text-right">
            Total:{" "}
            <span className="text-blue-700">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </p>
          <button
            onClick={handleCheckout}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Checkout Sekarang 💳
          </button>
        </div>
      </div>
    </div>
  );
}
