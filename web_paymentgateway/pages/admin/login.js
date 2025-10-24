// /pages/admin/login.js
import { useState } from "react";
import { useRouter } from "next/router";

export default function AdminLogin() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) return alert(data.error);
      localStorage.setItem("adminToken", data.token);
      router.push("/admin/dashboard");
    } catch (err) {
      alert("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdf6ec]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-[#8B0000] text-center mb-6">
          Admin Login
        </h1>
        <input
          name="phone"
          placeholder="Nomor Admin"
          className="w-full p-3 border mb-3 rounded-md"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="w-full p-3 border mb-4 rounded-md"
          onChange={handleChange}
          required
        />
        <button
          disabled={loading}
          className="w-full bg-[#8B0000] text-white py-3 rounded-md"
        >
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
