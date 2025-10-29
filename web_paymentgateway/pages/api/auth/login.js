// 📁 /pages/api/auth/login.js
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { identifier, password } = req.body;

  // Validasi input
  if (!identifier || !password) {
    return res.status(400).json({
      success: false,
      error: "Email/No. WhatsApp dan Password wajib diisi",
    });
  }

  try {
    // Cek apakah user ada (pakai email atau phone)
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    });

    if (!user) {
      return res.status(400).json({ success: false, error: "Akun tidak ditemukan" });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Password salah" });
    }

    // Cek verifikasi akun
    if (!user.verified) {
      return res.status(400).json({
        success: false,
        error: "Akun belum diverifikasi. Silakan verifikasi OTP dulu.",
      });
    }

    // Kirim data user (tanpa password)
    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role, // penting untuk redirect
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
