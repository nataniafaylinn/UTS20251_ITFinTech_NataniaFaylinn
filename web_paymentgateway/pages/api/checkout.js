// pages/api/checkout.js
import dbConnect from "@/lib/mongoose";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { items, userEmail } = req.body;
      if (!items || !items.length) return res.status(400).json({ success: false, error: "Items required" });

      // Ensure numeric values
      const subtotal = items.reduce((acc, item) => acc + Number(item.price) * Number(item.quantity), 0);
      const tax = Math.round(subtotal * 0.1); // 10% tax (rounded)
      const total = subtotal + tax;

      const checkout = await Checkout.create({
        items: items.map(i => ({
          product: i._id,
          name: i.name,
          price: Number(i.price),
          quantity: Number(i.quantity),
        })),
        subtotal,
        tax,
        total,
        status: "CREATED",
        userEmail: userEmail || null
      });

      res.status(201).json({ success: true, checkoutId: checkout._id, checkout });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  } else if (req.method === "GET") {
    try {
      const checkouts = await Checkout.find({}).sort({ createdAt: -1 });
      res.status(200).json({ success: true, checkouts });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
