// 📄 /pages/api/admin/products.js
import dbConnect from "@/lib/mongoose";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === "GET") {
      const products = await Product.find({});
      return res.status(200).json({ success: true, products });
    }

    if (req.method === "POST") {
      const { name, price, category, stock, image } = req.body;
      if (!name || !price)
        return res.status(400).json({ success: false, error: "Nama dan harga wajib diisi" });
      const product = await Product.create({ name, price, category, stock, image });
      return res.status(201).json({ success: true, product });
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json({ success: true, product });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error("❌ Product API error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
