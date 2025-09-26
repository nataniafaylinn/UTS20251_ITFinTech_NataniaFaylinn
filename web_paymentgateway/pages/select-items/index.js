// pages/select-items/index.js
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SelectItems() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex((i) => i._id === product._id);
    if (idx > -1) {
      cart[idx].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${product.name} ditambahkan ke keranjang!`);
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pilih Produk</h1>
        <Link
          href="/checkout"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Lihat Keranjang
        </Link>
      </div>

      {/* Produk list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p._id} className="border rounded-lg p-4 shadow-sm">
            <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
              {p.image ? (
                <img src={p.image} alt={p.name} className="max-h-full" />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            <h3 className="mt-3 font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-600">{p.category}</p>
            <p className="mt-2 font-bold">Rp {Number(p.price).toLocaleString()}</p>
            <div className="mt-3">
              <button
                onClick={() => addToCart(p)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded w-full"
              >
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol checkout di bawah */}
      <div className="mt-6 text-right">
        <Link
          href="/checkout"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Lanjut ke Checkout →
        </Link>
      </div>
    </div>
  );
}
