// pages/api/webhook/xendit.js
import dbConnect from "@/lib/mongoose";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

export const config = {
  api: {
    bodyParser: false, // biar raw body kepake
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Verifikasi token callback
    const token = req.headers["x-callback-token"];
    if (token !== process.env.XENDIT_CALLBACK_TOKEN) {
      console.warn("⚠️ Callback token tidak valid:", token);
      return res.status(403).json({ success: false, error: "Invalid callback token" });
    }

    // Baca raw body
    let rawBody = "";
    await new Promise((resolve) => {
      req.on("data", (chunk) => (rawBody += chunk));
      req.on("end", resolve);
    });

    console.log("📥 Webhook diterima:", rawBody);

    const event = JSON.parse(rawBody);

    // Cari payment di DB
    const payment = await Payment.findOne({ xenditInvoiceId: event.id });
    if (!payment) {
      console.error("❌ Payment tidak ditemukan untuk invoiceId:", event.id);
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    // Update payment
    payment.status = event.status;
    payment.meta = event;
    payment.updatedAt = new Date();
    await payment.save();

    // Kalau PAID, update checkout
    if (event.status === "PAID") {
      await Checkout.findByIdAndUpdate(payment.checkout, { status: "PAID" });
    }

    console.log("✅ Payment updated:", event.id, event.status);

    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
