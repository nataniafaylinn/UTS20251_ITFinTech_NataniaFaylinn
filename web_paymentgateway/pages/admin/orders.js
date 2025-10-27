// /pages/admin/orders.js

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#fdf6ec] p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 border-t-8 border-[#8B0000]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#8B0000]">
            🧾 Daftar Pembelian
          </h1>
          <Link
            href="/admin"
            className="text-[#8B0000] hover:underline font-semibold"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full border-collapse bg-[#fffdf8] shadow-sm">
            <thead className="bg-[#8B0000] text-white">
              <tr>
                <th className="p-3 border">User</th>
                <th className="p-3 border">Produk</th>
                <th className="p-3 border">Total</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-8 text-gray-500 italic"
                  >
                    Belum ada pesanan masuk
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr
                    key={o._id}
                    className="hover:bg-[#fdf6ec] transition border-b"
                  >
                    <td className="p-3 border text-gray-700 font-medium">
                      {o.user?.name || o.user?.phone || "Guest"}
                    </td>
                    <td className="p-3 border text-gray-700">
                      {o.items.map((it, i) => (
                        <div key={i} className="text-sm">
                          {it.product?.name} × {it.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="p-3 border font-semibold text-[#8B0000]">
                      Rp {o.totalAmount?.toLocaleString()}
                    </td>
                    <td className="p-3 border">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          o.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : o.status === "waiting"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {o.status || "unknown"}
                      </span>
                    </td>
                    <td className="p-3 border text-gray-600">
                      {new Date(o.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
