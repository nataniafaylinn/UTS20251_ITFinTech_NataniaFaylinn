// 📁 /pages/api/auth/register.js
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendWhatsApp } from "@/utils/fonnteClient";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name, email, phone, password } = req.body;

  if (!name || !phone || !password || !email) {
    return res.status(400).json({ success: false, error: "Semua field wajib diisi" });
  }

  // Format nomor HP
  let phoneFormatted = phone.trim().replace(/[\s\-()]/g, "");
  if (phoneFormatted.startsWith("0")) {
    phoneFormatted = "+62" + phoneFormatted.slice(1);
  } else if (!phoneFormatted.startsWith("+62")) {
    phoneFormatted = "+62" + phoneFormatted;
  }

  try {
    const existing = await User.findOne({
      $or: [{ phone: phoneFormatted }, { email: email.toLowerCase() }],
    });
    if (existing) {
      return res.status(400).json({ success: false, error: "Nomor atau email sudah terdaftar" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    // sebelum create user:
    const role = email.toLowerCase().endsWith("@gmail.com") ? "user" : "admin";

    await User.create({
      name,
      email: email.toLowerCase(),
      phone: phoneFormatted,
      password: hashed,
      otp,
      otpExpires,
      verified: false,
      role,
    });

    await sendWhatsApp(
      phoneFormatted,
      `Kode OTP kamu adalah *${otp}*. Berlaku 5 menit.`
    );

    return res.status(201).json({
      success: true,
      message: "Kode OTP dikirim ke WhatsApp. Silakan verifikasi akun.",
    });
  } catch (err) {
    console.error("❌ Register error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
