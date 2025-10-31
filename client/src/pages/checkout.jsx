import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Truck } from "lucide-react";
import axios from "axios";
import AddressModal from "../components/AddressModal";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { cartItems = [], totalPrice = 0 } = location.state || {};
  const [selectedPayment, setSelectedPayment] = useState("mandiri");
  const [selectedShipping, setSelectedShipping] = useState("SiCepat");
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Ambil alamat dari localStorage saat pertama kali load
  useEffect(() => {
    const savedAddress = localStorage.getItem("selectedAddress");
    if (savedAddress) setSelectedAddress(JSON.parse(savedAddress));
  }, []);

  // Gabungkan item cart yang sama
  const mergedCartItems = cartItems.reduce((acc, item) => {
    const existing = acc.find((x) => x.id === item.id || x.name === item.name);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);

  const mergedTotalPrice = mergedCartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // 🧾 Fungsi checkout
  const handleCheckout = async () => {
    if (mergedCartItems.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    if (!selectedAddress) {
      alert("Mohon tambahkan alamat pengiriman terlebih dahulu!");
      return;
    }

    setLoading(true);
    try {
      // 🔹 1. Simpan alamat ke database
      const addressRes = await axios.post(
        "http://localhost:5000/addresses",
        {
          user_id: userId,
          label: selectedAddress.label,
          recipient_name: selectedAddress.recipient_name,
          phone: selectedAddress.phone,
          full_address: selectedAddress.full_address,
          notes: selectedAddress.notes || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const addressId = addressRes.data.id;

      // 🔹 2. Buat pesanan baru
      const orderRes = await axios.post(
        "http://localhost:5000/orders",
        {
          user_id: userId,
          address_id: addressId,
          total_amount: mergedTotalPrice,
          payment_method: selectedPayment,
          status: "pending",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orderId = orderRes.data.orderId;
      console.log("🧾 Order sukses:", orderId);

      // 🔹 3. Kosongkan cart di backend
      try {
        await axios.delete(`http://localhost:5000/cart/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("🧹 Cart berhasil dikosongkan");
      } catch (cartErr) {
        console.warn("⚠️ Gagal hapus cart (tidak fatal):", cartErr);
      }

      // 🔹 4. Bersihkan data cart di localStorage
      localStorage.removeItem("cart");

      // 🔹 5. Simpan ID pesanan
      localStorage.setItem("order_id", orderId);

      // 🔹 6. Arahkan ke halaman pembayaran
      navigate("/payment", {
        state: { order_id: orderId, totalPrice: mergedTotalPrice },
      });

      alert("✅ Pesanan berhasil dibuat!");
    } catch (err) {
      console.error("❌ Gagal buat pesanan:", err);
      alert("Terjadi kesalahan saat membuat pesanan.");
    } finally {
      setLoading(false);
    }
  }; // ✅ ← ini penutup fungsi yang hilang sebelumnya!

  // Hitung ongkir dan total tagihan
  const shippingCost =
    selectedShipping === "SiCepat"
      ? 9000
      : selectedShipping === "JNE"
      ? 10000
      : 8500;

  const totalTagihan = mergedTotalPrice + shippingCost;

  // Daftar metode pembayaran
  const paymentMethods = [
    { id: "mandiri", name: "Mandiri Virtual Account", logo: "/img/mandiri.png" },
    { id: "bca", name: "BCA Virtual Account", logo: "/img/bca.png" },
    { id: "bni", name: "BNI Virtual Account", logo: "/img/bni.png" },
    { id: "bri", name: "BRI Virtual Account", logo: "/img/bri.png" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Progress Step */}
      <div className="flex justify-between items-center mb-10 text-sm text-gray-600">
        {["Keranjang", "Checkout", "Pembayaran", "Selesai"].map((step, i) => (
          <div key={i} className="flex-1 flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                i === 1 ? "border-blue-600 text-blue-600" : "border-gray-300"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`ml-2 ${
                i === 1 ? "text-blue-600 font-semibold" : "text-gray-500"
              }`}
            >
              {step}
            </span>
            {i < 3 && <div className="flex-1 h-[2px] bg-gray-300 mx-2"></div>}
          </div>
        ))}
      </div>

      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ==================== KIRI ==================== */}
        <div className="lg:col-span-2 space-y-5">
          {/* Alamat Pengiriman */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
              <MapPin size={20} className="text-blue-600" /> Alamat Pengiriman
            </h2>
            <div className="border-t pt-3">
              {selectedAddress ? (
                <>
                  <p className="font-semibold">
                    {selectedAddress.label} • {selectedAddress.recipient_name}
                  </p>
                  <p className="text-sm text-gray-700">
                    {selectedAddress.full_address}
                  </p>
                  <p className="text-sm text-gray-700">
                    {selectedAddress.phone}
                  </p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="mt-3 text-blue-600 font-medium hover:underline"
                  >
                    Ganti
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-start">
                  <p className="text-gray-500 text-sm mb-3">
                    Kamu belum menambahkan alamat pengiriman
                  </p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition"
                  >
                    + Tambahkan Alamat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Jasa Pengiriman */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
              <Truck size={20} className="text-blue-600" /> Pilih Jasa Pengiriman
            </h2>
            <select
              value={selectedShipping}
              onChange={(e) => setSelectedShipping(e.target.value)}
              className="border rounded-lg w-full px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="SiCepat">SiCepat (Rp9.000)</option>
              <option value="JNE">JNE (Rp10.000)</option>
              <option value="AnterAja">AnterAja (Rp8.500)</option>
            </select>
          </div>

          {/* Daftar Produk */}
          <div className="bg-white rounded-xl shadow p-5 divide-y">
            {mergedCartItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <img
                    src={`http://localhost:5000${item.imageUrl}`}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x Rp{item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-blue-600">
                  Rp{(item.price * item.quantity).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ==================== KANAN ==================== */}
        <div className="space-y-4 lg:sticky lg:top-20">
          {/* Metode Pembayaran */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-3">Metode Pembayaran</h2>
            <div className="space-y-3">
              {paymentMethods.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition hover:shadow-sm ${
                    selectedPayment === m.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={m.logo}
                    alt={m.name}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="flex-1 text-sm font-medium text-gray-700">
                    {m.name}
                  </span>
                  <input
                    type="radio"
                    name="payment"
                    checked={selectedPayment === m.id}
                    onChange={() => setSelectedPayment(m.id)}
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Ringkasan Pesanan */}
          <div className="bg-white rounded-xl shadow p-5">
            <h2 className="font-semibold mb-3">Ringkasan Pesanan</h2>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Total Harga Barang</span>
                <span>Rp{mergedTotalPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span>Ongkir (perkiraan)</span>
                <span>Rp{shippingCost.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2">
                <span>Total Tagihan</span>
                <span className="text-blue-600">
                  Rp{totalTagihan.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`mt-5 w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <CreditCard size={18} /> Bayar Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Alamat */}
      {showAddressModal && (
        <AddressModal
          setShowModal={setShowAddressModal}
          setSelectedAddress={setSelectedAddress}
        />
      )}
    </div>
  );
}
