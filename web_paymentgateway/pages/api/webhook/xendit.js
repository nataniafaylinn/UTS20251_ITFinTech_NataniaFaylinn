// pages/api/webhook/xendit.js
import dbConnect from "@/lib/mongoose";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

export const config = {
  api: {
    bodyParser: false,
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
    console.log("🔐 Token diterima:", token);
    console.log("🔐 Token expected:", process.env.XENDIT_CALLBACK_TOKEN);
    
    if (token !== process.env.XENDIT_CALLBACK_TOKEN) {
      console.warn("⚠️ Callback token tidak valid!");
      return res.status(403).json({ success: false, error: "Invalid callback token" });
    }

    // Baca raw body
    let rawBody = "";
    await new Promise((resolve) => {
      req.on("data", (chunk) => (rawBody += chunk));
      req.on("end", resolve);
    });

    console.log("📥 Webhook raw body:", rawBody);

    const event = JSON.parse(rawBody);
    console.log("📦 Event parsed:", {
      id: event.id,
      status: event.status,
      external_id: event.external_id,
      amount: event.amount
    });

    // Cari payment berdasarkan xenditInvoiceId
    const payment = await Payment.findOne({ xenditInvoiceId: event.id });
    
    if (!payment) {
      console.error("❌ Payment tidak ditemukan untuk invoiceId:", event.id);
      console.log("🔍 Mencoba cari semua payments...");
      const allPayments = await Payment.find({}).select('xenditInvoiceId checkout status').limit(5);
      console.log("📋 Sample payments di DB:", allPayments);
      return res.status(404).json({ success: false, error: "Payment not found" });
    }

    console.log("✅ Payment ditemukan:", {
      paymentId: payment._id,
      currentStatus: payment.status,
      checkoutId: payment.checkout
    });

    // Update payment status - pastikan uppercase
    const newStatus = event.status.toUpperCase();
    payment.status = newStatus;
    payment.meta = event;
    payment.updatedAt = new Date();
    await payment.save();
    
    console.log("💾 Payment status updated to:", newStatus);

    // Kalau PAID, update checkout juga
    if (newStatus === "PAID") {
      const checkout = await Checkout.findByIdAndUpdate(
        payment.checkout,
        { 
          status: "PAID",
          updatedAt: new Date()
        },
        { new: true } // return updated document
      );
      
      console.log("💰 Checkout updated:", {
        checkoutId: checkout?._id,
        newStatus: checkout?.status
      });
    }

    console.log("✅ Webhook processed successfully");

    return res.status(200).json({ 
      success: true, 
      message: "Webhook processed",
      payment: {
        id: payment._id,
        status: payment.status
      }
    });
    
  } catch (err) {
    console.error("❌ Webhook error:", err);
    console.error("Error stack:", err.stack);
    return res.status(500).json({ 
      success: false, 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}