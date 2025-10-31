import React, { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Edit2,
  User,
  Calendar,
  Mail,
  Phone,
  Venus,
} from "lucide-react";

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const id = localStorage.getItem("id");
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      alert("ID user tidak ditemukan, silakan login ulang.");
      navigate("/login");
      return;
    }

    API.get(`/profile/${id}`)
      .then((res) => setProfile(res.data))
      .catch(() => alert("Gagal memuat data profil"));
  }, [id, navigate]);

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
      setProfile((prev) => ({
        ...prev,
        photo_url: res.data.photo_url,
      }));
      setFile(null);
      setPreview("");
    } catch {
      alert("Upload foto gagal!");
    }
  };

  if (!profile) {
    return (
      <div className="text-center mt-20 text-gray-500 animate-pulse">
        Memuat data profil...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="grid md:grid-cols-3">
        {/* === BAGIAN INFORMASI KIRI === */}
        <div className="md:col-span-2 p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Profil Saya</h2>

          <div className="divide-y divide-gray-200 text-gray-700">
            <div className="flex items-center gap-3 py-4">
              <User className="text-blue-600" size={20} />
              <div>
                <span className="block text-sm text-gray-500">Nama Lengkap</span>
                <p className="text-lg font-semibold">{profile.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4">
              <Calendar className="text-blue-600" size={20} />
              <div>
                <span className="block text-sm text-gray-500">Tanggal Lahir</span>
                <p className="text-lg font-semibold">
                  {profile.birth_date || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4">
              <Venus className="text-blue-600" size={20} />
              <div>
                <span className="block text-sm text-gray-500">Jenis Kelamin</span>
                <p className="text-lg font-semibold">{profile.gender || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4">
              <Mail className="text-blue-600" size={20} />
              <div>
                <span className="block text-sm text-gray-500">Email</span>
                <p className="text-lg font-semibold">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-4">
              <Phone className="text-blue-600" size={20} />
              <div>
                <span className="block text-sm text-gray-500">Nomor HP</span>
                <p className="text-lg font-semibold">{profile.phone || "-"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow transition"
            >
              <Edit2 size={18} /> Edit Profil
            </button>
          </div>
        </div>

        {/* === BAGIAN FOTO KANAN === */}
        <div className="bg-gray-50 border-l border-gray-100 flex flex-col items-center justify-center p-10">
          <div className="relative group">
            <img
              src={preview || profile.photo_url || "/default-avatar.png"}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover shadow-lg ring-4 ring-blue-100 transition-all group-hover:ring-blue-300"
            />

            <label
              htmlFor="photoInput"
              className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-md transition-all"
            >
              <Camera size={18} />
            </label>
            <input
              type="file"
              accept="image/*"
              id="photoInput"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <h3 className="mt-4 text-xl font-semibold text-gray-800">
            {profile.full_name}
          </h3>
          <p className="text-gray-500 text-sm">{profile.email}</p>

          {file && (
            <button
              onClick={handleUpload}
              className="mt-3 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg shadow transition"
            >
              Upload Foto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
