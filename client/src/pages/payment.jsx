import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, QrCode, CheckCircle2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil order_id dari state atau localStorage
  const order_id = location.state?.order_id || localStorage.getItem("order_id");

  // State
  const [orderData, setOrderData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [expiredAt, setExpiredAt] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ambil data order saat halaman dibuka
  useEffect(() => {
    if (order_id) fetchOrderData();
  }, [order_id]);

  // 🔹 Ambil data order dari backend
  const fetchOrderData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/orders/${order_id}`);
      const order = res.data;

      if (!order) {
        console.warn("Order tidak ditemukan.");
        return;
      }

      setOrderData(order);
      // 🔹 Generate QRIS otomatis setelah order didapat
      generateQRIS(order.id, order.total_amount, order.customer_name);
    } catch (err) {
      console.error("❌ Gagal ambil data order:", err);
    }
  };

  // 🔹 Generate QRIS
  const generateQRIS = async (id, amount, customer) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/payment/qris", {
        order_id: id,
        amount,
        customer_name: customer,
      });

      setQrData(res.data);
      setExpiredAt(res.data.expires_at);
    } catch (err) {
      console.error("❌ Gagal membuat QRIS:", err);
      alert("Gagal membuat QRIS: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cek status pembayaran
  const handleCheckStatus = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/payment/status/${order_id}`);
      const status = res.data?.status;
  
      if (status === "paid") {
        alert("✅ Pembayaran berhasil!");
        navigate("/success");
      } else {
        alert("⚠️ Pembayaran belum diterima. Coba lagi nanti.");
      }
    } catch (err) {
      console.error("❌ Gagal cek status pembayaran:", err);
      alert("Gagal cek status pembayaran");
    }
  };

  // 🔹 Jika data order belum tersedia
  if (!orderData) {
    return (
      <div className="p-6 text-center text-red-500">
        Data pesanan tidak ditemukan.
      </div>
    );
  }

  // 🔹 Tampilan utama halaman
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6">
        {/* Judul */}
        <h2 className="text-2xl font-bold text-center mb-4">
          Menunggu Pembayaran
        </h2>

        {/* Info waktu expired */}
        {expiredAt && (
          <div className="flex items-center justify-center gap-2 text-yellow-600 mb-2">
            <Clock size={20} />
            <p>
              Bayar sebelum{" "}
              <b>{new Date(expiredAt).toLocaleString("id-ID")}</b>
            </p>
          </div>
        )}

        {/* Total pembayaran */}
        <div className="text-center mb-4">
          <p className="text-gray-600">Total Tagihan</p>
          <h3 className="text-3xl font-bold text-green-700">
            Rp{orderData.total_amount?.toLocaleString("id-ID")}
          </h3>
        </div>

        {/* QRIS */}
        {loading ? (
          <p className="text-center text-gray-500">Membuat QRIS...</p>
        ) : qrData ? (
          <div className="flex flex-col items-center">
            <QrCode size={28} className="text-green-600 mb-2" />

            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                qrData.qr_string
              )}`}
              alt="QR Code"
              className="mb-3 border p-2 rounded-lg"
            />

            <p className="text-gray-500 text-sm mb-4 text-center">
              Scan QRIS dengan aplikasi e-wallet atau m-banking kamu
            </p>

            <button
              onClick={handleCheckStatus}
              className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              Cek Status Pembayaran
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500">QRIS belum tersedia.</p>
        )}
      </div>
    </div>
  );
}
