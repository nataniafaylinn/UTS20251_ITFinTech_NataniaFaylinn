// pages/api/webhook/xendit.js
import dbConnect from "@/lib/mongoose";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

export const config = {
  api: {
    bodyParser: false, // penting! biar raw body dipakai
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
      return res.status(403).json({ success: false, error: "Invalid callback token" });
    }

    // Baca raw body dari request
    let rawBody = "";
    await new Promise((resolve) => {
      req.on("data", (chunk) => (rawBody += chunk));
      req.on("end", resolve);
    });

    const event = JSON.parse(rawBody);
    console.log("🔔 Webhook Xendit:", event);

    // Cari payment berdasarkan invoice id
    const payment = await Payment.findOne({ xenditInvoiceId: event.id });
    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    // Update status payment
    payment.status = event.status; // PAID, EXPIRED, FAILED, dll
    payment.meta = event;
    payment.updatedAt = new Date();
    await payment.save();

    // Jika payment sukses → update checkout juga
    if (event.status === "PAID") {
      await Checkout.findByIdAndUpdate(payment.checkout, { status: "PAID" });
    }

    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
