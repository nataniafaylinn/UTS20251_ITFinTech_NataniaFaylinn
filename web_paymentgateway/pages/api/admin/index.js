// /pages/admin/index.js
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ daily: [], monthly: [] });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data);
      });
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-red-800">📊 Admin Dashboard</h1>

      <div className="flex gap-4 mb-8">
        <Link href="/admin/orders" className="bg-white border shadow p-4 rounded-xl hover:bg-gray-100">
          🧾 Lihat Semua Order
        </Link>
        <Link href="/admin/products" className="bg-white border shadow p-4 rounded-xl hover:bg-gray-100">
          🛍️ Kelola Produk
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-3">Omzet Harian</h2>
      <div className="bg-white rounded-xl shadow p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#b91c1c" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-3">Omzet Bulanan</h2>
      <div className="bg-white rounded-xl shadow p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#1e40af" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
