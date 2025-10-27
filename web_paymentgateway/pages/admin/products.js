// 📄 /pages/admin/products.js
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });
  const [file, setFile] = useState(null);
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = form.image;

      // 🔼 Upload gambar jika admin memilih file
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.url;
        } else {
          alert("❌ Gagal upload gambar");
          setLoading(false);
          return;
        }
      }

      // 🔄 Kirim data ke API produk
      const method = editing ? "PUT" : "POST";
      const url = editing
        ? `/api/admin/products?id=${editing}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: imageUrl }),
      });

      const data = await res.json();
      if (data.success) {
        alert(editing ? "Produk berhasil diperbarui!" : "Produk berhasil ditambahkan!");
        setForm({ name: "", price: "", category: "", stock: "", image: "" });
        setFile(null);
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
          className="p-5 rounded-xl shadow-inner mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#fffaf5] border border-gray-300"
        >
          {["name", "price", "category", "stock"].map((field) => (
            <input
              key={field}
              type={field === "price" || field === "stock" ? "number" : "text"}
              name={field}
              placeholder={
                field === "name"
                  ? "Nama Produk"
                  : field === "price"
                  ? "Harga (Rp)"
                  : field === "category"
                  ? "Kategori"
                  : "Stok"
              }
              value={form[field]}
              onChange={handleChange}
              className="p-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] text-gray-800 font-medium placeholder-gray-500 bg-white"
              required={field === "name" || field === "price"}
            />
          ))}

          {/* Upload Gambar */}
          <div className="col-span-full">
            <label className="block mb-1 text-gray-700 font-semibold">Upload Gambar:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-gray-800 border-2 border-gray-400 rounded-md p-2 bg-white focus:border-[#8B0000]"
            />
            {form.image && !file && (
              <img
                src={form.image}
                alt="Preview"
                className="mt-3 w-32 h-32 object-cover rounded-lg shadow"
              />
            )}
            {file && (
              <p className="mt-2 text-sm text-gray-600">📷 File baru dipilih: {file.name}</p>
            )}
          </div>

          {/* Tombol Simpan */}
          <div className="col-span-full flex gap-3 mt-3">
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
                  setFile(null);
                }}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-400 transition font-semibold"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        {/* Daftar Produk */}
        <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-300 bg-white">
        <table className="w-full border-collapse rounded-2xl overflow-hidden text-gray-800">
            <thead className="bg-[#8B0000] text-white text-sm uppercase font-semibold">
            <tr>
                <th className="p-3 text-left">Gambar</th>
                <th className="p-3 text-left">Nama</th>
                <th className="p-3 text-left">Kategori</th>
                <th className="p-3 text-left">Harga</th>
                <th className="p-3 text-left">Stok</th>
                <th className="p-3 text-center">Aksi</th>
            </tr>
            </thead>
            <tbody className="bg-[#fffdf8]">
            {products.length === 0 ? (
                <tr>
                <td
                    colSpan="6"
                    className="text-center p-6 text-gray-500 italic"
                >
                    Belum ada produk yang ditambahkan
                </td>
                </tr>
            ) : (
                products.map((p, i) => (
                <tr
                    key={p._id}
                    className={`hover:bg-[#fdf1e7] transition ${
                    i % 2 === 0 ? "bg-[#fffaf5]" : "bg-white"
                    }`}
                >
                    <td className="p-3 text-center">
                    {p.image ? (
                        <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-300 mx-auto"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-400 rounded-xl">
                        No Img
                        </div>
                    )}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">{p.name}</td>
                    <td className="p-3 text-gray-700">{p.category || "-"}</td>
                    <td className="p-3 text-[#8B0000] font-bold">
                    Rp {p.price.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3 text-gray-800 font-medium">{p.stock}</td>
                    <td className="p-3 text-center">
                    <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 font-semibold hover:text-blue-800 mr-3 transition"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-600 font-semibold hover:text-red-800 transition"
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
