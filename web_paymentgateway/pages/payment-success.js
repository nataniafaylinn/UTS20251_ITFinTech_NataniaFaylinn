import Image from "next/image";
import Link from "next/link";

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-[#fdf6ec] flex flex-col items-center justify-center px-4">
      {/* Header */}
      <header className="flex items-center justify-center gap-4 mb-8">
        <Image
          src="/images/logo-pudinginaja.jpg"
          alt="pudinginaja logo"
          width={60}
          height={60}
          className="rounded-full"
        />
        <h1 className="text-3xl font-extrabold text-[#8B0000]">
          pudinginaja.jkt
        </h1>
      </header>

      {/* Card sukses */}
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-[#8B0000] mb-4">
          🎉 Pembayaran Berhasil!
        </h2>
        <p className="text-gray-700 mb-6">
          Terima kasih, pembayaran Anda sudah kami terima. Pesanan Anda sedang
          diproses.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="bg-[#8B0000] hover:bg-red-900 text-white py-3 px-4 rounded-lg font-semibold transition"
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/checkout"
            className="bg-gray-200 hover:bg-gray-300 text-[#8B0000] py-3 px-4 rounded-lg font-semibold transition"
          >
            Lihat Riwayat Pesanan
          </Link>
        </div>
      </div>
    </div>
  );
}
