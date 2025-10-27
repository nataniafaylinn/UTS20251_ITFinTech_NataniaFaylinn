// /pages/api/webhook/xendit.js
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";
import Order from "@/models/Order";

export default async function handler(req, res) {
  await dbConnect();

  // Xendit hanya mengirim POST webhook
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    console.log("📬 Webhook diterima:", req.body);

    // Validasi token callback (wajib)
    const token = req.headers["x-callback-token"];
    if (token !== process.env.XENDIT_CALLBACK_TOKEN) {
      console.log("❌ Token callback salah:", token);
      return res.status(403).json({ success: false, message: "Invalid callback token" });
    }

    const body = req.body;

    // Hanya proses kalau status = PAID
    if (body.status !== "PAID") {
      console.log("ℹ️ Status bukan PAID, abaikan webhook.");
      return res.status(200).json({ success: true });
    }

    // Update Payment
    const payment = await Payment.findOneAndUpdate(
      { xenditInvoiceId: body.id },
      { status: "PAID" },
      { new: true }
    ).populate("checkout");

    if (!payment) {
      console.log("❌ Payment tidak ditemukan untuk invoice ID:", body.id);
      return res.status(404).json({ success: false });
    }

    const checkout = payment.checkout;
    if (!checkout) {
      console.log("❌ Checkout tidak ditemukan untuk payment:", payment._id);
      return res.status(404).json({ success: false });
    }

    // Pastikan order belum pernah dibuat sebelumnya
    const existingOrder = await Order.findOne({
      user: checkout.user,
      totalAmount: checkout.total,
      status: "paid",
    });

    if (existingOrder) {
      console.log("⚠️ Order sudah ada:", existingOrder._id);
      return res.status(200).json({ success: true });
    }

    // Buat order baru
    const newOrder = await Order.create({
      user: checkout.user,
      items: checkout.items,
      totalAmount: checkout.total,
      status: "paid",
    });

    console.log("✅ Order berhasil dibuat:", newOrder._id);

    // Update checkout jadi paid
    checkout.status = "PAID";
    await checkout.save();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("💥 Error di webhook:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
