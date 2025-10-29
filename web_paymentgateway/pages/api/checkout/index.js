///pages/api/checkout/index.js

import dbConnect from "@/lib/mongoose";
import Checkout from "@/models/Checkout";
import User from "@/models/User";
import { sendCheckoutNotification } from "@/lib/whatsapp";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { items, userEmail, userId } = req.body;
      if (!items || !items.length)
        return res.status(400).json({ success: false, error: "Items required" });

      const subtotal = items.reduce(
        (acc, item) => acc + Number(item.price) * Number(item.quantity),
        0
      );
      const tax = Math.round(subtotal * 0.1);
      const total = subtotal + tax;

      const checkout = await Checkout.create({
        user: userId || null,
        items: items.map((i) => ({
          product: i._id || null,
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.quantity),
        })),
        subtotal,
        tax,
        total,
        status: "PENDING_PAYMENT",
        userEmail: userEmail || null,
      });

      console.log("✅ Checkout dibuat:", checkout._id);

      // 🔥 KIRIM NOTIFIKASI WHATSAPP JIKA USER LOGIN
      if (userId) {
        try {
          const user = await User.findById(userId);
          if (user && user.phone) {
            const notificationData = {
              checkoutId: checkout._id.toString(),
              items: items,
              total: total,
            };

            const result = await sendCheckoutNotification(user.phone, notificationData);
            
            if (result.success) {
              console.log('✅ Notifikasi WhatsApp checkout terkirim ke:', user.phone);
            } else {
              console.warn('⚠️ Gagal mengirim notifikasi WhatsApp, tetapi checkout berhasil');
            }
          }
        } catch (whatsappError) {
          console.error('❌ Error sending WhatsApp notification:', whatsappError);
          // Jangan gagalkan checkout jika notifikasi gagal
        }
      }

      return res
        .status(201)
        .json({ success: true, checkoutId: checkout._id.toString(), checkout });
    } catch (err) {
      console.error("❌ Error create checkout:", err);
      return res
        .status(500)
        .json({ success: false, error: err.message || "Internal Server Error" });
    }
  }

  if (req.method === "GET") {
    try {
      const checkouts = await Checkout.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, checkouts });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  res.setHeader("Allow", ["POST", "GET"]);
  return res
    .status(405)
    .json({ success: false, error: `Method ${req.method} Not Allowed` });
}