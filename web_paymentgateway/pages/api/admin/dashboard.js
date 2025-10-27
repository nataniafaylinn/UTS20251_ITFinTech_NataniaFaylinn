// /pages/api/admin/dashboard.js

import dbConnect from "@/lib/mongoose";
import Checkout from "@/models/Checkout";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  try {
    // 1️⃣ Total Produk
    const totalProducts = await Product.countDocuments();

    // 2️⃣ Total Pesanan
    const totalOrders = await Checkout.countDocuments();

    // 3️⃣ Total Omzet (hanya yang statusnya PAID)
    const omzetData = await Checkout.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalOmzet = omzetData[0]?.total || 0;

    // 4️⃣ Grafik penjualan per tanggal
    const salesByDate = await Checkout.aggregate([
      { $match: { status: "PAID" } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalSales: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Kirim semua hasil ke frontend
    res.status(200).json({
      totalProducts,
      totalOrders,
      totalOmzet,
      salesByDate,
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ message: "Server error" });
  }
}
