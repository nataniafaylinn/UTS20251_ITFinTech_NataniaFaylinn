// 📁 /pages/api/auth/login.js
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { identifier, password } = req.body; // identifier bisa email atau phone

  if (!identifier || !password) {
    return res.status(400).json({ success: false, error: "Email/Nomor dan password wajib diisi" });
  }

  // Normalisasi nomor kalau input berupa phone
  let query = {};
  if (identifier.includes("@")) {
    query = { email: identifier.toLowerCase() };
  } else {
    let phoneFormatted = identifier.trim().replace(/[\s\-()]/g, "");
    if (phoneFormatted.startsWith("0")) {
      phoneFormatted = "+62" + phoneFormatted.slice(1);
    } else if (!phoneFormatted.startsWith("+62")) {
      phoneFormatted = "+62" + phoneFormatted;
    }
    query = { phone: phoneFormatted };
  }

  try {
    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, error: "Akun tidak ditemukan" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: "Password salah" });
    }

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        error: "Akun belum diverifikasi OTP.",
      });
    }

    // Buat token JWT (kalau kamu pakai session nanti)
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      // token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
