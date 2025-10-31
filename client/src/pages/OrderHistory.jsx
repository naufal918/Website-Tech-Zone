import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId"); // ambil dari localStorage waktu login
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const userId = localStorage.getItem("userId");
    console.log("🧠 user_id dari localStorage:", userId); // 🪄 Tambah ini
    try {
      const res = await axios.get(`http://localhost:5000/orders/user/${userId}`);
      console.log("📦 Hasil fetch orders:", res.data);
      setOrders(res.data.orders || []);
      console.log("📦 orders dari backend:", res.data);
    } catch (err) {
      console.error("❌ Gagal ambil riwayat pesanan:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Memuat riwayat pesanan...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6">
        <h2 className="text-2xl font-bold text-center mb-6">🧾 Riwayat Pesanan</h2>

        {orders.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada pesanan.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">Pesanan #{order.id}</p>
                  <p className="text-gray-600 text-sm">
                    Total: Rp{Number(order.total_amount).toLocaleString("id-ID")}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Tanggal: {new Date(order.created_at).toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {order.status === "paid" ? (
                    <div className="flex items-center text-green-600 font-semibold">
                      <CheckCircle2 size={20} className="mr-1" /> Lunas
                    </div>
                  ) : order.status === "pending" ? (
                    <div className="flex items-center text-yellow-600 font-semibold">
                      <Clock size={20} className="mr-1" /> Menunggu
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 font-semibold">
                      <XCircle size={20} className="mr-1" /> Dibatalkan
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
