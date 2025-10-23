// pages/select-items/index.js

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function SelectItems() {
  const [products, setProducts] = useState([]);
  const router = useRouter();

  // Cek login
  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) {
      router.replace("/login");
    }
  }, [router]);

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
    <div className="min-h-screen bg-[#fdf6ec]">
      {/* Header */}
      <header className="flex items-center justify-center gap-4 py-6">
        <Image
          src="/images/logo-pudinginaja.jpg"
          alt="pudinginaja logo"
          width={60}
          height={60}
          className="rounded-full"
        />
        <h1 className="text-3xl font-extrabold text-[#8B0000]">
          pudinginaja.jkt
        </h1>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-12">
        <h2 className="text-2xl font-bold text-[#8B0000] mb-6">
          Pilih Produk
        </h2>

        {/* Grid produk */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white border border-red-100 rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col"
            >
              <div className="w-full aspect-[3/4] max-h-64 bg-[#fff6f6] rounded-lg overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-gray-400">
                    No Image
                  </span>
                )}
              </div>

              <h3 className="mt-4 font-semibold text-lg text-[#8B0000]">{p.name}</h3>
              <p className="text-sm text-gray-500">{p.category}</p>
              <p className="mt-2 font-bold text-gray-800">
                Rp {Number(p.price).toLocaleString()}
              </p>

              <button
                onClick={() => addToCart(p)}
                className="mt-auto bg-[#8B0000] hover:bg-red-900 text-white font-medium px-4 py-2 rounded-lg transition"
              >
                Tambah ke Keranjang
              </button>
            </div>
          ))}
        </div>

        {/* Checkout button */}
        <div className="mt-10 text-center">
          <Link
            href="/checkout"
            className="bg-[#8B0000] hover:bg-red-900 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow-md"
          >
            Lanjut ke Checkout →
          </Link>
        </div>
      </main>
    </div>
  );
}
