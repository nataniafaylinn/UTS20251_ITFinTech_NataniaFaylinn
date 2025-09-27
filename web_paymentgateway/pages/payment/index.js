// pages/payment/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function PaymentPage() {
  const router = useRouter();
  const { checkoutId } = router.query;
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!checkoutId) return; // tunggu checkoutId ada
    fetch(`/api/checkout/${checkoutId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCheckout(d.checkout);
        } else {
          console.error("Checkout fetch error:", d.error);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, [checkoutId]);

  async function handlePay() {
    setLoading(true);
    const res = await fetch("/api/create-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutId }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success && data.invoiceUrl) {
      window.location.href = data.invoiceUrl; // redirect ke Xendit
    } else {
      alert("Gagal membuat invoice: " + (data.error || JSON.stringify(data.raw || data)));
    }
  }

  // Kalau masih loading atau checkout null → tampilkan pesan
  if (!checkout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6ec]">
        <p className="text-[#8B0000] font-semibold">Memuat pembayaran...</p>
      </div>
    );
  }

  // ✅ aman render karena checkout udah ada
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
        <h1 className="text-3xl font-extrabold text-[#8B0000]">pudinginaja.jkt</h1>
      </header>

      <h2 className="text-2xl font-bold text-[#8B0000] my-6 w-full max-w-2xl text-left">
        Pembayaran
      </h2>

      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6 space-y-4">
        <p className="text-gray-700">
          <span className="font-semibold">Checkout ID:</span> {checkout._id}
        </p>
        <p className="text-lg font-bold text-[#8B0000]">
          Total: Rp {Number(checkout.total).toLocaleString()}
        </p>

        <button
          disabled={loading}
          onClick={handlePay}
          className={`w-full font-semibold py-3 rounded-lg transition ${
            loading
              ? "bg-red-300 text-white cursor-not-allowed"
              : "bg-[#8B0000] hover:bg-red-900 text-white"
          }`}
        >
          {loading ? "Membuat Invoice..." : "Bayar dengan Xendit"}
        </button>
      </div>
    </div>
  );
}
