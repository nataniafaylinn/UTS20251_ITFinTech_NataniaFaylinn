// pages/verify-otp.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("pendingUser");
    if (!stored) {
      router.replace("/register");
    } else {
      setUser(JSON.parse(stored));
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulasi verifikasi OTP
      if (otp === "123456") {
        localStorage.removeItem("pendingUser");
        localStorage.setItem("loggedIn", "true");
        alert("Verifikasi berhasil! Akun Anda telah aktif.");
        router.push("/select-items");
      } else {
        alert("Kode OTP salah. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf6ec] px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border-t-8 border-[#8B0000]">
        {/* Logo */}
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

        <p className="text-sm text-center mt-4 text-gray-700">
          Tidak menerima kode?{" "}
          <button
            className="text-[#8B0000] font-semibold hover:underline"
            onClick={() => alert("Kode OTP baru telah dikirim!")}
          >
            Kirim Ulang
          </button>
        </p>
      </div>
    </div>
  );
}
