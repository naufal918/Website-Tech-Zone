import React, { useState, useEffect } from "react";
import API from "../api";
import { Layers, PlusCircle, Trash2, Edit2, Save, X } from "lucide-react";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // ambil data produk dari backend
  useEffect(() => {
    API.get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

// tambah / update produk
const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("⚠️ Anda belum login sebagai admin!");
    return;
  }

  console.log("🔑 Token yang dikirim:", token);

  // Siapkan form data untuk dikirim
  const formData = new FormData();
  formData.append("name", name);
  formData.append("price", price);
  formData.append("stock", stock);
  formData.append("category", category || ""); // hindari null
  formData.append("description", description);
  if (image) formData.append("image", image);

  try {
    // konfigurasi axios (token + form-data)
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    let res;
    if (editMode && editId) {
      // ✏️ update produk
      res = await API.put(`/products/${editId}`, formData, config);
      alert(res.data?.message || "✏️ Produk berhasil diperbarui!");
    } else {
      // ➕ tambah produk baru
      res = await API.post("/products", formData, config);
      alert(res.data?.message || "✅ Produk berhasil ditambahkan!");
    }

    // 🔄 reset form
    setName("");
    setPrice("");
    setStock("");
    setCategory("");
    setDescription("");
    setImage(null);
    setEditMode(false);
    setEditId(null);

    // 🔁 refresh data produk
    const { data } = await API.get("/products");
    setProducts(data);
  } catch (err) {
    console.error("❌ Gagal menyimpan produk:", err.response || err);

    if (err.response?.status === 401) {
      const msg = err.response?.data?.message || "Unauthorized (harap login dulu sebagai admin).";
      alert("❌ " + msg);
    } else if (err.response?.status === 403) {
      alert("🚫 Akses ditolak! Hanya admin yang boleh menambah/mengedit produk.");
    } else {
      alert("❌ Gagal menyimpan produk. Periksa koneksi atau server.");
    }
  }
};

// hapus produk
const handleDelete = async (id) => {
  if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
  try {
    const token = localStorage.getItem("token"); // ✅ kirim token juga
    await API.delete(`/products/${id}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    setProducts(products.filter((p) => p.id !== id));
    alert("🗑️ Produk berhasil dihapus!");
  } catch (err) {
    console.error("❌ Gagal menghapus produk:", err);
    if (err.response?.status === 401) {
      alert("❌ Tidak punya izin untuk menghapus produk (Unauthorized).");
    } else {
      alert("❌ Terjadi kesalahan saat menghapus produk.");
    }
  }
};

// mulai edit produk
const handleEdit = (p) => {
  setEditMode(true);
  setEditId(p.id);
  setName(p.name);
  setPrice(p.price);
  setStock(p.stock);
  setCategory(p.category || ""); // ✅ hindari value null di select
  setDescription(p.description);
};

// batal edit
const handleCancelEdit = () => {
  setEditMode(false);
  setEditId(null);
  setName("");
  setPrice("");
  setStock("");
  setCategory("");
  setDescription("");
  setImage(null);
};


  return (
    <div className="min-h-screen bg-white text-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
            <Layers className="text-blue-600" /> Manajemen Komponen PC & Laptop
          </h1>
          <span className="text-slate-500 text-sm">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md"
        >
          <h2 className="text-xl font-semibold mb-5 flex items-center gap-2 text-slate-800">
            {editMode ? (
              <>
                <Edit2 className="text-amber-500" /> Edit Komponen
              </>
            ) : (
              <>
                <PlusCircle className="text-blue-600" /> Tambah Komponen Baru
              </>
            )}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nama Komponen (mis. GPU RTX 4070)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="number"
              placeholder="Harga (Rp)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="p-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <input
            type="number"
            placeholder="Jumlah Stok"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none w-full"
            required
          />

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                Kategori Komponen
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none w-full"
                required
              >
                <option value="">Pilih Kategori</option>
                <option value="laptop">Laptop</option>
                <option value="vga">VGA / GPU</option>
                <option value="router">Router & Jaringan</option>
                <option value="aksesoris">Aksesoris Komputer</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                Gambar Komponen
              </label>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="p-3 rounded-lg bg-gray-50 border border-gray-300 w-full"
                accept="image/*"
              />
            </div>
          </div>

          <textarea
            placeholder="Deskripsi Komponen (mis. VGA dengan performa tinggi untuk gaming dan editing)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none w-full h-24 resize-none"
            required
          />

          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all ${
                editMode
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {editMode ? "💾 Simpan Perubahan" : "➕ Tambah Komponen"}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-3 rounded-xl font-semibold shadow border border-gray-300 hover:bg-gray-100 transition-all"
              >
                ❌ Batal
              </button>
            )}
          </div>
        </form>

        {/* DAFTAR PRODUK */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">
            📦 Daftar Produk
          </h2>

          {products.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              Belum ada komponen 😢 <br /> Tambahkan produk baru untuk mulai menjual.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                >
                  <img
                    src={
                      p.imageUrl
                        ? `http://localhost:5000${p.imageUrl}`
                        : "https://via.placeholder.com/200"
                    }
                    alt={p.name}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <h3 className="mt-3 font-semibold text-lg text-slate-800">
                    {p.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-blue-600 font-bold">
                      Rp {p.price?.toLocaleString("id-ID")}
                    </p>
                    <span className="text-xs text-slate-500">
                      Stok: {p.stock}
                    </span>
                  </div>

                  {/* Tombol Edit & Hapus */}
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => handleEdit(p)}
                      className="flex items-center gap-1 text-amber-500 hover:text-amber-600 text-sm font-semibold"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-semibold"
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
