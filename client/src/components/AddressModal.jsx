import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import AddAddressModal from "./AddAddressModal";

export default function AddressModal({ setShowModal, setSelectedAddress }) {
  const [addresses, setAddresses] = useState([]); // ✅ selalu array
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // ✅ Fetch semua alamat user
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/addresses/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Pastikan hasil API berupa array
        if (Array.isArray(res.data)) {
          setAddresses(res.data);
        } else {
          console.warn("⚠️ API /addresses/user/:id tidak mengembalikan array:", res.data);
          setAddresses([]); // fallback aman
        }
      } catch (err) {
        console.error("❌ Gagal ambil alamat:", err);
        setAddresses([]); // biar gak error pas render
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [userId, token, showAddModal]);

  // ✅ Tambah alamat baru
  const handleAddAddress = async (newAddress) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/addresses",
        { ...newAddress, user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Tambah ke list langsung tanpa refetch
      setAddresses((prev) => [
        { id: res.data.id, ...newAddress },
        ...prev,
      ]);
      setShowAddModal(false);
    } catch (err) {
      console.error("❌ Gagal menambah alamat:", err);
    }
  };

  // ✅ Pilih alamat
  const handleSelect = (address) => {
    setSelectedAddress(address);
    localStorage.setItem("selectedAddress", JSON.stringify(address));
    setShowModal(false);
  };

  // ✅ Hapus alamat
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin hapus alamat ini?")) return;
    try {
      await axios.delete(`http://localhost:5000/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("❌ Gagal hapus alamat:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-semibold">Daftar Alamat</h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tombol Tambah */}
        <button
          onClick={() => setShowAddModal(true)}
          className="border border-blue-500 text-blue-600 font-medium rounded-lg w-full py-2 hover:bg-blue-50 mb-4"
        >
          + Tambah Alamat Baru
        </button>

        {/* Daftar Alamat */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : Array.isArray(addresses) && addresses.length > 0 ? (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="border rounded-lg p-3 flex justify-between items-start"
              >
                <div>
                  <p className="font-semibold">{addr.label}</p>
                  <p className="text-sm text-gray-700">{addr.recipient_name}</p>
                  <p className="text-sm text-gray-700">{addr.phone}</p>
                  <p className="text-sm text-gray-700">{addr.full_address}</p>
                  {addr.notes && (
                    <p className="text-sm text-gray-500 italic">{addr.notes}</p>
                  )}
                  <div className="text-xs text-blue-600 mt-2 flex gap-4">
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="hover:underline text-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleSelect(addr)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Pilih
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Belum ada alamat.</p>
        )}
      </div>

      {/* Modal Tambah Alamat */}
      {showAddModal && (
        <AddAddressModal
          setShowAddModal={setShowAddModal}
          onSave={handleAddAddress}
        />
      )}
    </div>
  );
}
