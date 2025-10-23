// pages/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 3000); // redirect setelah 3 detik
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdf6ec]">
      {/* Logo */}
      <Image
        src="/images/logo-pudinginaja.jpg"
        alt="pudinginaja logo"
        width={120}
        height={120}
        className="rounded-full mb-6 animate-bounce"
      />

      {/* Judul */}
      <h1 className="text-3xl font-extrabold text-[#8B0000]">
        Selamat datang di pudinginaja.jkt 🍮
      </h1>
      
      {/* Loading Spinner */}
      <div className="mt-8 w-12 h-12 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
