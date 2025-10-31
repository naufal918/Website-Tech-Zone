import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import axios from "axios";
import AddressModal from "./AddressModal"; // kita buat file ini di bawah

export default function CheckoutPage() {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Ambil alamat utama dari backend
  useEffect(() => {
    const fetchMainAddress = async () => {
      console.log("📦 Fetching alamat utama untuk user:", userId);
      console.log("📦 userId:", userId);
console.log("✅ Response alamat:", res.data);
      try {
        const res = await axios.get(`http://localhost:5000/addresses/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Data alamat diterima:", res.data);
        setSelectedAddress(res.data[0]);
      } catch (err) {
        console.error("❌ Gagal ambil alamat:", err);
      }
    };
    fetchMainAddress();
  }, [userId, token]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      {/* Alamat Pengiriman */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="font-semibold mb-2 flex items-center gap-2 text-gray-700">
          <MapPin size={20} className="text-green-600" />
          ALAMAT PENGIRIMAN
        </h2>

        {selectedAddress ? (
          <div className="border-t pt-3">
            <p className="font-semibold">
              {selectedAddress.label} • {selectedAddress.recipient_name}
            </p>
            <p className="text-sm text-gray-700">
              {selectedAddress.full_address}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {selectedAddress.phone}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-blue-600 font-medium hover:underline"
            >
              Ganti
            </button>
          </div>
        ) : (
          <p className="text-gray-500 mt-3">Belum ada alamat pengiriman.</p>
        )}
      </div>

      {/* Modal daftar alamat */}
      {showModal && (
        <AddressModal
          setShowModal={setShowModal}
          setSelectedAddress={setSelectedAddress}
        />
      )}
    </div>
  );
}
