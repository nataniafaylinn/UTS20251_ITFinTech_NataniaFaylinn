// pages/admin/index.js

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalOmzet: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        const data = await res.json();

        // ✅ Update data summary & grafik sesuai struktur backend
        setSummary({
          totalOrders: data.totalOrders,
          totalProducts: data.totalProducts,
          totalOmzet: data.totalOmzet,
        });

        // Format data chart
        const formattedChart = data.salesByDate.map((item) => ({
          date: item._id,
          omzet: item.totalSales,
        }));

        setChartData(formattedChart);
      } catch (err) {
        console.error("❌ Gagal ambil data dashboard:", err);
      }
    }

    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf6ec] p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 border-t-8 border-[#8B0000]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#8B0000]">
            Dashboard Admin
          </h1>
          <Link
            href="/login"
            className="text-[#8B0000] hover:underline font-semibold"
          >
            Keluar ↩
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#fffdf8] p-6 rounded-xl shadow text-center border-l-4 border-[#8B0000]">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">
              Total Pesanan
            </h2>
            <p className="text-3xl font-extrabold text-[#8B0000]">
              {summary.totalOrders}
            </p>
          </div>
          <div className="bg-[#fffdf8] p-6 rounded-xl shadow text-center border-l-4 border-[#8B0000]">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">
              Total Produk
            </h2>
            <p className="text-3xl font-extrabold text-[#8B0000]">
              {summary.totalProducts}
            </p>
          </div>
          <div className="bg-[#fffdf8] p-6 rounded-xl shadow text-center border-l-4 border-[#8B0000]">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">
              Total Omzet
            </h2>
            <p className="text-3xl font-extrabold text-green-700">
              Rp {summary.totalOmzet.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#fffdf8] p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-bold text-[#8B0000] mb-4">
            Grafik Omzet Harian
          </h2>
          <div className="h-72">
            {chartData.length === 0 ? (
              <p className="text-center text-gray-500 italic">
                Belum ada data pembelian untuk ditampilkan.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
                  />
                  <Bar dataKey="omzet" fill="#8B0000" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="/admin/products"
            className="bg-[#8B0000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900 transition"
          >
            📦 Kelola Produk
          </Link>
          <Link
            href="/admin/orders"
            className="bg-[#8B0000] text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-900 transition"
          >
            🧾 Lihat Pembelian
          </Link>
        </div>
      </div>
    </div>
  );
}
