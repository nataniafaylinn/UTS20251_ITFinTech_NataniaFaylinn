// /pages/api/admin/stats.js
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function handler(req, res) {
  await dbConnect();

  try {
    // Total omzet per hari (7 hari terakhir)
    const daily = await Order.aggregate([
      {
        $match: { status: "paid" },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Total omzet per bulan
    const monthly = await Order.aggregate([
      {
        $match: { status: "paid" },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ success: true, daily, monthly });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Gagal mengambil statistik" });
  }
}
