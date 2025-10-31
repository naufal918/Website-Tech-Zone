import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Laptop",
      image: "images/tuff15.png",
      description: "Laptop gaming dan kantor dengan performa terbaik.",
      link: "/category/laptop",
    },
    {
      name: "VGA / GPU",
      image: "images/asusrtx.png",
      description: "Kartu grafis terbaru untuk gaming dan rendering.",
      link: "/category/vga",
    },
    {
      name: "Router & Jaringan",
      image: "images/mikrotik.png",
      description: "Router, switch, dan perangkat jaringan lainnya.",
      link: "/category/router",
    },
    {
      name: "Aksesoris Komputer",
      image: "images/razerhd.jpg",
      description: "Keyboard, mouse, headset, dan lainnya.",
      link: "/category/aksesoris",
    },
  ];

  return (
    <div className="space-y-12 px-4 sm:px-6 md:px-8">
      {/* Hero Section */}
      <section className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
        <img
          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200"
          alt="Komponen PC"
          className="w-full h-64 sm:h-80 md:h-96 object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-blue-400 drop-shadow-lg">
            TechZone 💻
          </h1>
          <p className="mt-3 text-base sm:text-xl font-medium max-w-md">
            Toko online terpercaya untuk komponen PC, laptop, dan aksesoris gaming!
          </p>
        </div>
      </section>

      {/* Section Kategori */}
      <section>
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center flex items-center justify-center gap-2">
          💻 Kategori Produk 🔌
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => navigate(category.link)}
              className="
                bg-white rounded-xl shadow hover:shadow-lg hover:-translate-y-1
                transition transform duration-200 p-4 flex flex-col items-center text-center
                focus:outline-none focus:ring-2 focus:ring-sky-500
              "
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-24 h-24 sm:w-32 sm:h-32 object-contain mb-3 transition-transform duration-200 hover:scale-105"
              />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-sky-600">
                {category.name}
              </h3>
              <p className="text-gray-600 text-sm mt-1">{category.description}</p>

              <span className="mt-3 text-sky-600 text-sm font-medium hover:underline">
                Lihat Produk →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Testimoni */}
      <section className="bg-slate-100 rounded-2xl shadow p-6 sm:p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">💬 Testimoni Pelanggan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { name: "Rani", text: "Barang sampai cepat dan original! Mantap 👍" },
            { name: "Dimas", text: "Pelayanan super ramah, harga juga oke banget!" },
            { name: "Lia", text: "Laptopnya sesuai deskripsi, pengemasan rapi banget 💻" },
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-6">
              <p className="italic text-gray-700 text-sm sm:text-base">“{t.text}”</p>
              <h4 className="mt-4 font-semibold text-blue-600 text-sm sm:text-base">
                — {t.name}
              </h4>
            </div>
          ))}
        </div>
      </section>

      {/* Tentang Kami */}
      <section className="bg-white rounded-2xl shadow p-6 sm:p-8 text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-3">Tentang Kami</h2>
        <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed text-sm sm:text-base">
          TechZone adalah toko online yang menyediakan berbagai komponen PC, laptop, dan
          aksesoris gaming dengan harga bersaing. Kami berkomitmen memberikan produk asli,
          berkualitas tinggi, serta pelayanan terbaik untuk kebutuhan teknologi Anda.
        </p>
        <img
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000"
          alt="Tentang Kami"
          className="mt-6 w-full sm:w-3/4 md:w-2/3 mx-auto rounded-xl shadow"
        />
      </section>
    </div>
  );
}
