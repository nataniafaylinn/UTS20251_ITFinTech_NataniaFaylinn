// pages/api/checkout/index.js
import dbConnect from "@/lib/mongoose";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { items, userEmail } = req.body;

      // Validasi
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: "Cart kosong" });
      }

      // Hitung subtotal, tax, total
      const subtotal = items.reduce(
        (acc, i) => acc + Number(i.price) * Number(i.quantity),
        0
      );
      const tax = Math.round(subtotal * 0.1); // 10%
      const total = subtotal + tax;

      // Buat checkout baru di database
      const checkout = await Checkout.create({
        items,
        subtotal,
        tax,
        total,
        userEmail,
      });

      // Berhasil
      return res.status(201).json({
        success: true,
        checkoutId: checkout._id,
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
