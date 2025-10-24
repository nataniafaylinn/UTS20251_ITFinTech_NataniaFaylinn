// /pages/api/auth/register.js
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendWhatsApp } from "@/utils/twilioClient";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ success: false, error: "Semua field wajib diisi" });
  }

  try {
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, error: "Nomor sudah terdaftar" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    // ⬇️ Simpan user ke DB dulu
    await User.create({
      name,
      phone,
      password: hashed,
      otp,
      otpExpires,
      verified: false,
    });

    // Kirim OTP via WhatsApp
    await sendWhatsApp(phone, `Kode OTP Anda: *${otp}*. Berlaku 5 menit.`);

    console.log("✅ OTP terkirim ke:", phone, otp);
    return res.status(201).json({
      success: true,
      message: "Kode OTP dikirim. Silakan verifikasi untuk aktivasi akun.",
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
