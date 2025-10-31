import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil data order dari state navigate() (kalau dikirim)
  const order_id = location.state?.order_id || localStorage.getItem("order_id");
  const total = location.state?.total || localStorage.getItem("order_total");

  const handleGoToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        {/* Ikon sukses */}
        <CheckCircle2 size={80} className="text-green-600 mx-auto mb-4" />

        <h1 className="text-2xl font-bold mb-2 text-green-700">
          Pembayaran Berhasil!
        </h1>
        <p className="text-gray-600 mb-6">
          Terima kasih telah berbelanja di <b>TechZone</b>.
        </p>

        {/* Detail pesanan */}
        <div className="bg-gray-100 p-4 rounded-lg text-left mb-6">
          <p>
            <b>ID Pesanan:</b> #{order_id || "-"}
          </p>
          <p>
            <b>Total Pembayaran:</b>{" "}
            {total ? `Rp${Number(total).toLocaleString("id-ID")}` : "-"}
          </p>
          <p>
            <b>Status:</b> ✅ Lunas
          </p>
        </div>

        {/* Tombol aksi */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
          >
            Kembali ke Beranda
          </button>
          <button
            onClick={() => navigate("/orders-history")}
            className="w-full border border-green-600 text-green-700 py-2 rounded-xl hover:bg-green-50"
          >
            Lihat Riwayat Pesanan
          </button>
        </div>
      </div>
    </div>
  );
}
