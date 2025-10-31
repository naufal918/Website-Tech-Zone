import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { Camera, Save, Trash2, User, ArrowRight } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState({
    full_name: "",
    birth_date: "",
    gender: "",
    email: "",
    phone: "",
    photo_url: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const id = localStorage.getItem("id");
  const navigate = useNavigate();

  // === Ambil data profil saat halaman dibuka ===
  useEffect(() => {
    if (!id) {
      alert("ID user tidak ditemukan, silakan login ulang.");
      navigate("/login");
      return;
    }
    API.get(`/profile/${id}`)
      .then((res) => setProfile(res.data))
      .catch(() => alert("Gagal memuat data profil."));
  }, [id, navigate]);

  // === Ubah data profil di form ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // === Simpan profil ===
  const handleSave = async () => {
    try {
      const res = await API.put(`/profile/${id}`, profile);
      alert(res.data.message);
    } catch {
      alert("Gagal menyimpan profil.");
    }
  };

  // === Upload foto profil ===
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("Pilih foto dulu!");
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await API.post(`/profile/upload-photo/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
      setProfile((prev) => ({ ...prev, photo_url: res.data.photo_url }));
      setFile(null);
      setPreview("");
    } catch {
      alert("Upload foto gagal!");
    }
  };

  // === Hapus akun secara permanen ===
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Yakin mau hapus akun ini? Semua data seperti profil, alamat, keranjang, dan pesanan akan dihapus permanen!"
    );
    if (!confirmDelete) return;

    try {
      const res = await API.delete(`/deleteAccount/${id}`);
      if (res.data.success) {
        alert("Akun kamu dan semua data berhasil dihapus.");
        localStorage.clear(); // hapus semua data login
        navigate("/login"); // kembali ke halaman login
      } else {
        alert(res.data.message || "Gagal menghapus akun.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus akun.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="grid md:grid-cols-3">
        {/* === FORM BAGIAN KIRI === */}
        <div className="md:col-span-2 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Biodata Diri
          </h2>

          <div className="space-y-5 text-gray-700">
            <div>
              <label className="block font-semibold mb-1">Nama Lengkap</label>
              <input
                type="text"
                name="full_name"
                value={profile.full_name || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  name="birth_date"
                  value={profile.birth_date || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Jenis Kelamin</label>
                <select
                  name="gender"
                  value={profile.gender || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Pilih...</option>
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={profile.email || ""}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Nomor HP</label>
              <input
                type="text"
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* === PROFIL SAMPING KANAN === */}
        <div className="bg-gray-50 border-l border-gray-100 p-8 flex flex-col items-center justify-between">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <img
                src={preview || profile.photo_url || "/default-avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-100 shadow-md transition-all duration-300 group-hover:ring-blue-300"
              />
              <label
                htmlFor="photoInput"
                className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-md transition-all"
              >
                <Camera size={18} />
              </label>
              <input
                id="photoInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              {profile.full_name || "User"}
            </h3>
            <p className="text-sm text-gray-500">{profile.email}</p>

            {file && (
              <button
                onClick={handleUpload}
                className="mt-3 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg shadow transition"
              >
                Upload Foto
              </button>
            )}
          </div>

          <div className="mt-10 w-full flex flex-col gap-3">
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Save size={18} /> Simpan
            </button>

            {/* 🔥 Tombol Hapus Akun Permanen */}
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 hover:scale-[1.02] transition transform shadow"
            >
              <Trash2 size={18} /> Hapus Akun
            </button>

            <button
              onClick={() => navigate("/profile/view")}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <User size={18} /> Lihat Profil <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
