// pages/api/checkout/[id].js
import dbConnect from "@/lib/mongoose";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const checkout = await Checkout.findById(id).populate('items.product');
      if (!checkout) return res.status(404).json({ success: false, error: "Checkout not found" });
      res.status(200).json({ success: true, checkout });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
