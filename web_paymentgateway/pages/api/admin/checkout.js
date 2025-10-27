import dbConnect from "@/lib/mongoose";
import Checkout from "@/models/Checkout";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const checkouts = await Checkout.find()
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, checkouts });
    } catch (err) {
      console.error("❌ Error ambil data checkout:", err);
      res.status(500).json({ success: false, error: "Gagal ambil data checkout" });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}
