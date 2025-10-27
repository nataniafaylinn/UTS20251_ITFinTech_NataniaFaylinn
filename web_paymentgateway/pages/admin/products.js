// /pages/admin/products.js
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", category: "", stock: "", image: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    if (data.success) setProducts(data.products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/admin/products?id=${editing}` : "/api/admin/products";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert(editing ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!");
        setForm({ name: "", price: "", category: "", stock: "", image: "" });
        setEditing(null);
        fetchProducts();
      } else {
        alert("❌ Gagal menyimpan produk");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name,
      price: p.price,
      category: p.category || "",
      stock: p.stock || 0,
      image: p.image || "",
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-[#fdf6ec] p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-8 border-t-8 border-[#8B0000]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-[#8B0000]">Kelola Produk</h1>
          <Link href="/admin" className="text-[#8B0000] hover:underline font-semibold">
            ← Kembali ke Dashboard
          </Link>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-xl shadow-inner mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Nama Produk"
            value={form.name}
            onChange={handleChange}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Harga (Rp)"
            value={form.price}
            onChange={handleChange}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Kategori"
            value={form.category}
            onChange={handleChange}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stok"
            value={form.stock}
            onChange={handleChange}
            className="p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
          />
          <input
            type="text"
            name="image"
            placeholder="URL Gambar"
            value={form.image}
            onChange={handleChange}
            className="p-3 border rounded-md col-span-full focus:outline-none focus:ring-2 focus:ring-[#8B0000]"
          />

          <div className="col-span-full flex gap-3">
            <button
              disabled={loading}
              className="bg-[#8B0000] text-white px-5 py-2 rounded-md hover:bg-red-900 transition font-semibold"
            >
              {loading ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ name: "", price: "", category: "", stock: "", image: "" });
                }}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-400 transition font-semibold"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Daftar Produk */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-[#fffdf8] shadow-sm rounded-xl">
            <thead className="bg-[#8B0000] text-white">
              <tr>
                <th className="p-3 border">Gambar</th>
                <th className="p-3 border">Nama</th>
                <th className="p-3 border">Kategori</th>
                <th className="p-3 border">Harga</th>
                <th className="p-3 border">Stok</th>
                <th className="p-3 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-6 text-gray-500 italic">
                    Belum ada produk yang ditambahkan
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-[#fdf6ec] transition">
                    <td className="p-3 border">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-lg shadow"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-400 rounded-lg">
                          No Img
                        </div>
                      )}
                    </td>
                    <td className="p-3 border font-medium">{p.name}</td>
                    <td className="p-3 border">{p.category || "-"}</td>
                    <td className="p-3 border text-[#8B0000] font-semibold">
                      Rp {p.price.toLocaleString()}
                    </td>
                    <td className="p-3 border">{p.stock}</td>
                    <td className="p-3 border">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
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
