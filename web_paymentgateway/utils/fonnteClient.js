// utils/fonnteClient.js
import fetch from "node-fetch"; // pastikan kamu install: npm install node-fetch

export async function sendWhatsApp(to, message) {
  try {
    // 🔹 Pastikan format nomor WA sesuai (tanpa tanda +)
    let formatted = to.replace(/\D/g, ""); // hapus semua karakter non-digit
    if (formatted.startsWith("0")) {
      formatted = "62" + formatted.slice(1);
    } else if (!formatted.startsWith("62")) {
      formatted = "62" + formatted; // fallback
    }

    // 🔹 Kirim ke Fonnte
    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: process.env.FONNTE_API_KEY, // pastikan ada di .env.local
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: formatted,
        message: message,
      }),
    });

    const data = await response.json();

    // 🔹 Jika gagal
    if (!response.ok) {
      console.error("❌ Gagal kirim WA via Fonnte:", data);
      throw new Error(data?.detail || data?.message || "Gagal mengirim pesan WhatsApp");
    }

    console.log("✅ Pesan terkirim via Fonnte:", data);
    return data;
  } catch (err) {
    console.error("❌ Error kirim WA via Fonnte:", err);
    throw new Error("Gagal mengirim pesan WhatsApp: " + err.message);
  }
}
