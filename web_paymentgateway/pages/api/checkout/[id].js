// pages/api/checkout/[id].js
import dbConnect from "@/lib/mongoose";
import Checkout from "@/models/Checkout";
import "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const checkout = await Checkout.findById(id).populate("items.product");

      if (!checkout) {
        return res.status(404).json({
          success: false,
          error: "Checkout tidak ditemukan",
        });
      }

      return res.status(200).json({
        success: true,
        checkout,
      });
    } catch (err) {
      console.error("Checkout [id] GET error:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Internal Server Error",
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }
}
