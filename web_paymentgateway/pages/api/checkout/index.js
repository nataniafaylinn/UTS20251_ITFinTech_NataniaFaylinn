// pages/api/checkout/index.js
import dbConnect from "@/lib/mongoose";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { items, userEmail } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: "Cart kosong" });
      }

      const subtotal = items.reduce(
        (acc, i) => acc + Number(i.price) * Number(i.quantity),
        0
      );
      const tax = Math.round(subtotal * 0.1);
      const total = subtotal + tax;

      const checkout = await Checkout.create({
        items: items.map((i) => ({
          product: i._id || null, // kalau ada referensi produk
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        subtotal,
        tax,
        total,
        userEmail,
      });

      return res.status(201).json({
        success: true,
        checkoutId: checkout._id.toString(), // 🔥 pastikan ini ada
      });
    } catch (err) {
      console.error("Checkout POST error:", err);
      return res
        .status(500)
        .json({ success: false, error: err.message || "Internal Server Error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ success: false, error: `Method ${req.method} Not Allowed` });
  }
}
