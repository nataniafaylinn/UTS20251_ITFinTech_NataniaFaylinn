// pages/login.js

import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // simulasi login sederhana dulu
      if (form.email && form.password) {
        localStorage.setItem("loggedIn", "true");
        router.push("/select-items");
      } else {
        alert("Isi email dan password terlebih dahulu!");
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

        <h1 className="text-3xl font-extrabold text-center text-[#8B0000] mb-6">
          Login Akun
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
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
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-700">
            Belum punya akun?{" "}
            <Link href="/register" className="text-[#8B0000] hover:underline font-semibold">
                Daftar di sini
            </Link>
        </p>
      </div>
    </div>
  );
}