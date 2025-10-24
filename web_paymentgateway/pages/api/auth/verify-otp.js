// /pages/api/auth/verify-otp.js
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const { phone, otpInput } = req.body;

  if (!phone || !otpInput) {
    return res
      .status(400)
      .json({ success: false, error: "Nomor dan OTP wajib diisi" });
  }

  try {
    // Cari user berdasarkan phone
    const user = await User.findOne({ phone });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "User tidak ditemukan" });
    }

    console.log("=== DEBUG OTP VERIFICATION ===");
    console.log("📞 Phone:", phone);
    console.log("🔐 OTP Input:", otpInput);
    console.log("💾 OTP di DB:", user.otp);
    console.log("⏰ OTP Expires:", user.otpExpires);
    console.log("🕐 Waktu Sekarang:", new Date());
    console.log("✅ Status Verified Sebelumnya:", user.verified);

    // Cek apakah OTP ada
    if (!user.otp) {
      return res
        .status(400)
        .json({ success: false, error: "OTP tidak ditemukan atau sudah digunakan" });
    }

    // Cek OTP expired terlebih dahulu
    if (Date.now() > new Date(user.otpExpires).getTime()) {
      return res
        .status(400)
        .json({ success: false, error: "OTP sudah kedaluwarsa" });
    }

    // Cek OTP valid (perbandingan string ke string)
    if (user.otp.toString() !== otpInput.toString()) {
      console.log("❌ OTP tidak cocok!");
      return res
        .status(400)
        .json({ success: false, error: "OTP salah" });
    }

    console.log("✅ OTP valid! Memperbarui user...");

    // ✅ Update user jadi verified
    user.verified = true;
    user.otp = undefined; // Gunakan undefined untuk menghapus field
    user.otpExpires = undefined;
    
    // Simpan perubahan
    const savedUser = await user.save();

    console.log("💾 User setelah disimpan:", {
      _id: savedUser._id,
      phone: savedUser.phone,
      verified: savedUser.verified,
      otp: savedUser.otp,
      otpExpires: savedUser.otpExpires
    });

    // Verifikasi bahwa data benar-benar tersimpan
    const verifiedUser = await User.findById(user._id);
    console.log("🔍 Verifikasi dari DB:", {
      verified: verifiedUser.verified,
      otp: verifiedUser.otp
    });

    if (!verifiedUser.verified) {
      console.error("⚠️ WARNING: User belum ter-update di database!");
      return res
        .status(500)
        .json({ success: false, error: "Gagal memverifikasi user" });
    }

    // 🔑 Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Ubah ke 7 hari
    );

    console.log("🎉 Verifikasi berhasil!");

    return res.status(200).json({
      success: true,
      message: "Akun berhasil diverifikasi!",
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        verified: true
      }
    });
  } catch (err) {
    console.error("❌ Verify OTP error:", err);
    console.error("Stack trace:", err.stack);
    return res
      .status(500)
      .json({ 
        success: false, 
        error: "Terjadi kesalahan server",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
  }
}