// /pages/api/admin/orders.js
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const orders = await Order.find()
        .populate("user", "name phone")
        .populate("items.product", "name price")
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, orders });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, error: "Gagal mengambil data order" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
