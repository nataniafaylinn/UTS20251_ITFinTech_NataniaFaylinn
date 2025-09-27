// pages/api/webhook/xendit.js
import dbConnect from "@/lib/mongoose";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Verifikasi token callback dari Xendit (opsional, tapi best practice)
    const token = req.headers["x-callback-token"];
    if (token !== process.env.XENDIT_CALLBACK_TOKEN) {
      return res.status(403).json({ success: false, error: "Invalid callback token" });
    }

    const event = req.body;

    // Cari payment berdasarkan invoice id
    const payment = await Payment.findOne({ xenditInvoiceId: event.id });
    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    // Update status payment
    payment.status = event.status; // bisa PAID, EXPIRED, FAILED, dll
    payment.updatedAt = new Date();
    await payment.save();

    // Jika payment sukses → update checkout juga
    if (event.status === "PAID") {
      await Checkout.findByIdAndUpdate(payment.checkout, { status: "PAID" });
    }

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
