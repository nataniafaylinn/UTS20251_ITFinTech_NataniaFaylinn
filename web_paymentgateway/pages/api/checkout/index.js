// pages/api/checkout/index.js
import dbConnect from "@/lib/mongoose";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { items, userEmail } = req.body;
      if (!items || !items.length)
        return res.status(400).json({ success: false, error: "Items required" });

      const subtotal = items.reduce(
        (acc, item) => acc + Number(item.price) * Number(item.quantity),
        0
      );
      const tax = Math.round(subtotal * 0.1); // 10% pajak
      const total = subtotal + tax;

      const checkout = await Checkout.create({
        items: items.map((i) => ({
          product: i._id || null,
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.quantity),
        })),
        subtotal,
        tax,
        total,
        status: "CREATED",
        userEmail: userEmail || null,
      });

      console.log("✅ Checkout dibuat:", checkout._id);

      return res
        .status(201)
        .json({ success: true, checkoutId: checkout._id.toString(), checkout });
    } catch (err) {
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
