// pages/checkout/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const subtotal = cart.reduce((acc, i) => acc + Number(i.price) * Number(i.quantity), 0);
  const tax = Math.round(subtotal * 0.1); // 10%
  const total = subtotal + tax;

  async function handleCheckout() {
    if (cart.length === 0) return alert("Keranjang kosong");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, userEmail: email }),
    });
    const data = await res.json();
    if (data.success) {
      // clear cart (optional)
      localStorage.removeItem("cart");
      // navigate to payment page
      router.push(`/payment?checkoutId=${data.checkoutId}`);
    } else {
      alert("Gagal membuat checkout: " + (data.error || "unknown"));
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>

      <div className="border rounded p-4 mb-4">
        {cart.length === 0 ? (
          <p className="text-gray-600">Keranjangmu kosong.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Produk</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Harga</th>
                <th className="py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((i) => (
                <tr key={i._id} className="border-b">
                  <td className="py-2">{i.name}</td>
                  <td className="py-2">{i.quantity}</td>
                  <td className="py-2">Rp {Number(i.price).toLocaleString()}</td>
                  <td className="py-2">Rp {(Number(i.price) * Number(i.quantity)).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-4 text-right">
          <p>Subtotal: Rp {subtotal.toLocaleString()}</p>
          <p>Pajak (10%): Rp {tax.toLocaleString()}</p>
          <p className="font-bold">Total: Rp {total.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="email"
          placeholder="Email (untuk invoice)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button onClick={handleCheckout} className="w-full bg-blue-600 text-white px-4 py-2 rounded">
        Buat Checkout & Lanjut Bayar
      </button>
    </div>
  );
}
