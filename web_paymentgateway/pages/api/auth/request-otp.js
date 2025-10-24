// /pages/api/auth/request-otp.js
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { sendWhatsApp } from "@/utils/twilioClient";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: "Nomor WhatsApp wajib diisi" });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }

    // 🔁 Buat OTP baru dan simpan ke DB
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 menit
    await user.save();

    await sendWhatsApp(phone, `Kode OTP baru kamu: *${otp}*. Berlaku 5 menit.`);
    console.log("✅ OTP baru terkirim ke:", phone, otp);

    return res.status(200).json({
      success: true,
      message: "Kode OTP baru telah dikirim.",
    });
  } catch (err) {
    console.error("❌ Request OTP error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
