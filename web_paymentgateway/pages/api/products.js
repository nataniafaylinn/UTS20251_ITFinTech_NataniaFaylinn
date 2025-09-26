// pages/api/products.js
import dbConnect from "@/lib/mongoose";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const products = await Product.find({});
      res.status(200).json({ success: true, products });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } else if (req.method === "POST") {
    // seed or create product
    try {
      const { name, price, category, stock, image } = req.body;
      if (!name || !price) return res.status(400).json({ success: false, error: "name and price required" });
      const prod = await Product.create({ name, price, category, stock, image });
      res.status(201).json({ success: true, product: prod });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
