// pages/checkout/index.js
import { useEffect, useState } from "react";
import Image from "next/image";

export default function CheckoutPage() {
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(cartData);
  }, []);

  const handleQtyChange = (id, type) => {
    const updatedCart = cart.map((item) =>
      item._id === id
        ? {
            ...item,
            quantity:
              type === "plus"
                ? item.quantity + 1
                : item.quantity > 1
                ? item.quantity - 1
                : 1,
          }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (id) => {
    if (confirm("Apakah Anda yakin ingin membatalkan produk ini?")) {
      const updatedCart = cart.filter((item) => item._id !== id);
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  async function handleCheckout() {
    if (!email) {
      alert("Mohon isi email Anda");
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, userEmail: email }),
      });

      const data = await res.json();
      console.log("📦 Checkout response:", data);

      if (data.success) {
        // 🔥 gunakan checkoutId, bukan checkout._id
        window.location.href = `/payment?checkoutId=${data.checkoutId}`;
      } else {
        alert("Gagal membuat checkout: " + data.error);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#fdf6ec] flex flex-col items-center py-10 px-4">
      <header className="flex items-center justify-center gap-4">
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

      <h2 className="text-2xl font-bold text-[#8B0000] my-6 w-full max-w-3xl text-left">
        Checkout
      </h2>

      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 font-semibold text-[#8B0000]">Produk</th>
              <th className="py-2 font-semibold text-[#8B0000] text-center">Qty</th>
              <th className="py-2 font-semibold text-[#8B0000] text-right">Harga</th>
              <th className="py-2 font-semibold text-[#8B0000] text-right">Total</th>
              <th className="py-2 font-semibold text-[#8B0000] text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item._id} className="border-b">
                <td className="py-3 text-gray-800">{item.name}</td>
                <td className="py-3 text-center text-gray-800">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleQtyChange(item._id, "minus")}
                      className="px-2 py-1 bg-[#8B0000] text-white rounded-md hover:bg-red-900"
                    >
                      -
                    </button>
                    <span className="min-w-[20px]">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item._id, "plus")}
                      className="px-2 py-1 bg-[#8B0000] text-white rounded-md hover:bg-red-900"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="py-3 text-right text-gray-800">
                  Rp {Number(item.price).toLocaleString()}
                </td>
                <td className="py-3 text-right text-gray-800">
                  Rp {(item.price * item.quantity).toLocaleString()}
                </td>
                <td className="py-3 text-center">
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="px-3 py-1 bg-gray-200 text-red-600 rounded-md hover:bg-red-100"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 text-right space-y-1">
          <p className="text-gray-700">
            Subtotal: Rp {subtotal.toLocaleString()}
          </p>
          <p className="text-gray-700">
            Pajak (10%): Rp {tax.toLocaleString()}
          </p>
          <p className="font-bold text-lg text-[#8B0000]">
            Total: Rp {total.toLocaleString()}
          </p>
        </div>

        <input
          type="email"
          placeholder="Email Anda"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-6 w-full border border-[#8B0000] rounded-lg px-4 py-3 
                     text-[#8B0000] placeholder-[#8B0000]/60
                     focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
        />

        <button
          onClick={handleCheckout}
          className="mt-6 w-full bg-[#8B0000] hover:bg-red-900 text-white font-semibold py-3 rounded-lg transition"
        >
          Buat Checkout & Bayar
        </button>
      </div>
    </div>
  );
}
