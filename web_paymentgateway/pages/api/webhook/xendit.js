// /pages/api/webhook/xendit.js
import dbConnect from "@/lib/mongoose";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import Order from "@/models/Order";
import User from "@/models/User";
import { sendPaymentSuccessNotification } from "@/lib/whatsapp";

export const config = {
  api: {
    bodyParser: false, // penting: biar bisa handle raw JSON dari Xendit
  },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // 🧩 Baca raw body dari request
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString();

    console.log("📬 Webhook diterima mentah:", rawBody);

    // Parse body JSON
    const body = JSON.parse(rawBody || "{}");
    console.log("✅ Body setelah parse:", body);

    // 🔐 Validasi token callback dari Xendit
    const token = req.headers["x-callback-token"];
    if (token !== process.env.XENDIT_CALLBACK_TOKEN) {
      console.log("❌ Token callback salah:", token);
      return res.status(403).json({ success: false, message: "Invalid callback token" });
    }

    // Cek status payment
    if (body.status !== "PAID") {
      console.log("ℹ️ Status bukan PAID, abaikan webhook.");
      return res.status(200).json({ success: true, message: "Ignored non-paid event" });
    }

    // Update payment jadi PAID
    const payment = await Payment.findOneAndUpdate(
      { xenditInvoiceId: body.id },
      { status: "PAID" },
      { new: true }
    ).populate("checkout");

    if (!payment) {
      console.log("❌ Payment tidak ditemukan untuk invoice ID:", body.id);
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    const checkout = payment.checkout;
    if (!checkout) {
      console.log("❌ Checkout tidak ditemukan untuk payment:", payment._id);
      return res.status(404).json({ success: false, message: "Checkout not found" });
    }

    const userEmail = checkout.userEmail || "Guest";

    // Cegah duplikasi order
    const existingOrder = await Order.findOne({
      userEmail,
      totalAmount: checkout.total,
      status: "paid",
    });

    if (existingOrder) {
      console.log("⚠️ Order sudah ada:", existingOrder._id);
      checkout.status = "PAID";
      await checkout.save();
      return res.status(200).json({ success: true, message: "Order already exists" });
    }

    // 🧾 Buat order baru
    const newOrder = await Order.create({
      userEmail,
      items: checkout.items.map(i => ({
        product: i.product || null,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      totalAmount: checkout.total,
      status: "paid",
    });

    console.log("✅ Order berhasil dibuat:", newOrder._id);

    // Update checkout jadi PAID
    checkout.status = "PAID";
    await checkout.save();

    // 🔥 KIRIM NOTIFIKASI WHATSAPP JIKA USER LOGIN
    if (checkout.user) {
      try {
        const user = await User.findById(checkout.user);
        if (user && user.phone) {
          const paymentData = {
            paymentId: payment._id.toString(),
            amount: checkout.total,
            paidAt: new Date().toISOString(),
            items: checkout.items
          };

          const result = await sendPaymentSuccessNotification(user.phone, paymentData);

          if (result.success) {
            console.log('✅ Notifikasi WhatsApp pembayaran berhasil terkirim ke:', user.phone);
          } else {
            console.warn('⚠️ Gagal mengirim notifikasi WhatsApp pembayaran');
          }
        }
      } catch (whatsappError) {
        console.error('❌ Error sending payment WhatsApp notification:', whatsappError);
        // Jangan gagalkan proses webhook jika notifikasi gagal
      }
    }

    res.status(200).json({ success: true, message: "Order created", orderId: newOrder._id });
  } catch (err) {
    console.error("💥 Error di webhook:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}