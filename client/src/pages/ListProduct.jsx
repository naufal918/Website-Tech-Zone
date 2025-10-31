import { useEffect, useState } from "react";

export default function ListProduct() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Nanti bisa diganti dengan API asli
    setProducts([
      { id: 1, name: "Laptop Quantum X", price: "Rp 15.000.000", image: "https://via.placeholder.com/300" },
      { id: 2, name: "Headset HyperBeat", price: "Rp 2.500.000", image: "https://via.placeholder.com/300" },
      { id: 3, name: "Smartwatch Nova X", price: "Rp 3.200.000", image: "https://via.placeholder.com/300" },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-10">
      <h1 className="text-4xl font-bold text-center text-blue-400 mb-10">
        Daftar Produk Tech Zone
      </h1>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-gray-800 hover:bg-gray-700 rounded-2xl overflow-hidden shadow-lg transition transform hover:-translate-y-2 hover:shadow-blue-500/40"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-56 object-cover"  
            />
            <div className="p-5 text-center">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-blue-400 font-bold mb-4">{product.price}</p>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition">
                Detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
