// /pages/verify-otp.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  // Ambil data user yang pending dari localStorage
  useEffect(() => {
    const pending = localStorage.getItem("pendingUser");
    if (!pending) {
      router.replace("/register");
    } else {
      setUserData(JSON.parse(pending));
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData) return;

    setLoading(true);
    try {
      console.log("📤 Mengirim verifikasi:", {
        phone: userData.phone,
        otpInput: otp,
      });

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: userData.phone, // kirim hanya phone
          otpInput: otp,         // dan otpInput
        }),
      });

      const data = await res.json();
      console.log("📥 Respons dari server:", data);

      if (!data.success) {
        alert(data.error || "Kode OTP salah.");
        return;
      }

      // Hapus pending data & arahkan ke login
      localStorage.removeItem("pendingUser");
      alert("Akun berhasil diverifikasi! 🎉");
      router.push("/login");
    } catch (err) {
      console.error("❌ Verify error:", err);
      alert("Terjadi kesalahan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf6ec] px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border-t-8 border-[#8B0000]">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo-pudinginaja.jpg"
            alt="pudinginaja logo"
            width={80}
            height={80}
            className="rounded-full"
          />
        </div>

        <h1 className="text-3xl font-extrabold text-center text-[#8B0000] mb-2">
          Verifikasi OTP
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Masukkan kode OTP yang dikirim ke WhatsApp kamu
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Masukkan 6 digit kode OTP"
            className="w-full text-center text-lg tracking-widest p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#8B0000]"
            maxLength={6}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-[#8B0000] text-white p-3 rounded-md hover:bg-red-900 transition font-semibold"
          >
            {loading ? "Memverifikasi..." : "Verifikasi Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}
