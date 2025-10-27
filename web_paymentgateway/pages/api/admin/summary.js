// /pages/api/admin/summary.js
// Notes: API summary admin (versi real) - ambil data dari MongoDB

import dbConnect from "@/lib/mongoose";
import Product from "@/models/Product";
import Order from "@/models/Order";

export default async function handler(req, res) {
  try {
    await dbConnect();

    // Hitung total pesanan, produk, dan omzet
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const paidOrders = await Order.find({ status: "paid" });

    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    // Buat data chart per bulan
    const orders = await Order.find({ status: "paid" });
    const monthlyRevenue = {};

    orders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleString("default", { month: "short" });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount;
    });

    const chartData = Object.keys(monthlyRevenue).map((month) => ({
      month,
      revenue: monthlyRevenue[month],
    }));

    res.status(200).json({
      success: true,
      summary: {
        totalOrders,
        totalProducts,
        totalRevenue,
      },
      chartData,
    });
  } catch (err) {
    console.error("❌ Error get summary:", err);
    res.status(500).json({ success: false, message: "Gagal ambil data summary" });
  }
}
