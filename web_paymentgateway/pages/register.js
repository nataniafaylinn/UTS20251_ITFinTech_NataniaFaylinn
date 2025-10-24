// /pages/register.js
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

export default function Register() {
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Panggil endpoint register untuk buat user baru di MongoDB
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Gagal mendaftar.");
        return;
      }

      // ✅ Simpan data user sementara ke localStorage
      localStorage.setItem("pendingUser", JSON.stringify(form));

      alert("Kode OTP telah dikirim ke WhatsApp kamu.");
      router.push("/verify-otp");
    } catch (err) {
      console.error("❌ Register error:", err);
      alert("Terjadi kesalahan. Silakan coba lagi.");
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

        <h1 className="text-3xl font-extrabold text-center text-[#8B0000] mb-6">
          Daftar Akun Baru
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Nama Lengkap"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#8B0000]"
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            type="text"
            placeholder="Nomor WhatsApp (misal: +628123456789)"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#8B0000]"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#8B0000]"
            onChange={handleChange}
            required
          />
          <button
            disabled={loading}
            className="w-full bg-[#8B0000] text-white p-3 rounded-md hover:bg-red-900 transition font-semibold"
          >
            {loading ? "Mengirim OTP..." : "Daftar"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-700">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-[#8B0000] hover:underline font-semibold"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
