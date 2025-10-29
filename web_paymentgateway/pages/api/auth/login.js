// pages/api/auth/login.js
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendWhatsApp } from "@/utils/fonnteClient";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, error: "Nomor dan password wajib diisi" });
  }

  // 🔹 Format nomor ke bentuk internasional
  let phoneFormatted = phone.trim();
  phoneFormatted = phoneFormatted.replace(/[\s\-()]/g, ""); // hapus spasi, strip, tanda kurung

  if (phoneFormatted.startsWith("0")) {
    phoneFormatted = "+62" + phoneFormatted.slice(1);
  } else if (!phoneFormatted.startsWith("+62")) {
    phoneFormatted = "+62" + phoneFormatted; // fallback untuk input aneh
  }

  try {
    const user = await User.findOne({ phone: phoneFormatted });
    if (!user) {
      return res.status(404).json({ success: false, error: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Password salah" });
    }

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        error: "Akun belum diverifikasi. Silakan verifikasi OTP terlebih dahulu.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 menit
    await user.save();

    await sendWhatsApp(
      phoneFormatted,
      `Kode OTP login kamu adalah *${otp}*. Berlaku 5 menit.`
    );

    return res.status(200).json({ success: true, message: "OTP dikirim via WhatsApp" });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
