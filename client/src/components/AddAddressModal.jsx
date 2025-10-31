import React, { useState } from "react";
import { X, MapPin, Navigation } from "lucide-react";

export default function AddAddressModal({ setShowAddModal, onSave }) {
  const [step, setStep] = useState(1);
  const [addressInput, setAddressInput] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [label, setLabel] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [notes, setNotes] = useState("");

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = () => {
    if (!recipientName || !phone || !fullAddress) {
      alert("Lengkapi semua data alamat!");
      return;
    }

    const newAddress = {
      label,
      recipient_name: recipientName,
      phone,
      full_address: fullAddress,
      notes,
    };

    onSave(newAddress);
    setShowAddModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-lg relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-lg font-semibold">Tambah Alamat</h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center items-center mb-6">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-semibold ${
                  step === num
                    ? "bg-blue-600 text-white"
                    : "border-2 border-blue-400 text-blue-400"
                }`}
              >
                {num}
              </div>
              {num !== 3 && (
                <div
                  className={`w-12 h-[2px] ${
                    step > num ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        {/* Step 1 - Cari lokasi */}
        {step === 1 && (
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">
              Di mana lokasi tujuan pengirimanmu?
            </h3>
            <input
              type="text"
              placeholder="Tulis nama jalan / gedung / perumahan"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              className="w-full border rounded-lg p-2 mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
            <button className="flex items-center gap-2 border rounded-lg w-full py-2 justify-center hover:bg-blue-50">
              <Navigation size={18} className="text-blue-600" />
              Gunakan Lokasi Saat Ini
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Tidak ketemu?{" "}
              <button
                onClick={handleNext}
                className="text-blue-600 font-medium hover:underline"
              >
                Isi alamat secara manual
              </button>
            </p>
          </div>
        )}

        {/* Step 2 - Tentukan titik (dummy dulu) */}
        {step === 2 && (
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">
              Tentukan titik lokasi pengiriman
            </h3>
            <div className="border rounded-lg h-56 flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <MapPin size={28} className="text-blue-400 mb-2" />
              <p className="text-sm">(Peta akan ditampilkan di sini nanti)</p>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:underline"
              >
                ← Kembali
              </button>
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              >
                Lanjut
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Isi detail alamat */}
        {step === 3 && (
          <div>
            <h3 className="font-semibold mb-4 text-gray-800">
              Lengkapi detail alamatmu
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="Nama penerima"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Nomor telepon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            <textarea
              placeholder="Alamat lengkap"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              rows={3}
              className="border rounded-lg p-2 w-full resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none mb-3"
            ></textarea>

            <input
              type="text"
              placeholder="Label (Rumah, Kantor, dll)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="border rounded-lg p-2 w-full mb-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />

            <textarea
              placeholder="Catatan (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="border rounded-lg p-2 w-full resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"
            ></textarea>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                className="text-gray-600 hover:underline"
              >
                ← Kembali
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Simpan Alamat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
