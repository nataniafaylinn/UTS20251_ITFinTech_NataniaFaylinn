// pages/api/create-invoice.js
import dbConnect from "@/lib/mongoose";
import Checkout from "@/models/Checkout";
import Payment from "@/models/Payment";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { checkoutId } = req.body;
  if (!checkoutId) {
    return res.status(400).json({ success: false, error: "checkoutId required" });
  }

  try {
    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) {
      return res.status(404).json({ success: false, error: "Checkout not found" });
    }

    // Body invoice untuk Xendit
    const body = {
      external_id: `checkout-${checkout._id}-${Date.now()}`,
      amount: checkout.total,
      payer_email: checkout.userEmail || "",
      description: `Pembayaran checkout ${checkout._id}`,
      success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment?checkoutId=${checkout._id}`,
    };

    // 🔑 Pakai SECRET API KEY (dari .env.local)
    const auth = Buffer.from(`${process.env.XENDIT_SECRET_API_KEY}:`).toString("base64");

    const resp = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (resp.status >= 400) {
      return res.status(resp.status).json({ success: false, error: data });
    }

    // Simpan Payment
    const payment = await Payment.create({
      checkout: checkout._id,
      amount: checkout.total,
      currency: "IDR",
      status: data.status || "PENDING",
      xenditInvoiceId: data.id || data.invoice_id || null,
      paymentUrl: data.invoice_url || data.invoiceUrl || null,
      meta: data,
    });

    // Update status checkout → PENDING_PAYMENT
    checkout.status = "PENDING_PAYMENT";
    await checkout.save();

    return res.status(201).json({
      success: true,
      invoiceUrl: payment.paymentUrl,
      raw: data,
      paymentId: payment._id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
