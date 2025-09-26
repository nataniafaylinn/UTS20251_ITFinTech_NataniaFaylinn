// pages/payment/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PaymentPage() {
  const router = useRouter();
  const { checkoutId } = router.query;
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!checkoutId) return;
    fetch(`/api/checkout/${checkoutId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCheckout(d.checkout);
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
      // redirect user to Xendit invoice URL
      window.location.href = data.invoiceUrl;
    } else {
      alert("Gagal membuat invoice: " + (data.error || JSON.stringify(data.raw || data)));
    }
  }

  if (!checkout) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pembayaran</h1>
      <div className="border rounded p-4 mb-4">
        <p>Checkout ID: {checkout._id}</p>
        <p>Total: Rp {Number(checkout.total).toLocaleString()}</p>
      </div>
      <button disabled={loading} onClick={handlePay} className="w-full bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Membuat Invoice...' : 'Bayar dengan Xendit'}
      </button>
    </div>
  );
}
