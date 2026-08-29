"use client";

import { ArrowLeft, Trash2, Database, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";

export default function SettingsPage() {
  const router = useRouter();

  const handleResetData = async () => {
    if (confirm("PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data? Aksi ini tidak dapat dibatalkan!")) {
      try {
        await db.delete(); // Deletes the entire IndexedDB database
        await db.open(); // Re-open the database to initialize schemas
        alert("Semua data berhasil dihapus.");
        router.push("/");
      } catch (error) {
        console.error("Gagal menghapus data", error);
        alert("Terjadi kesalahan saat menghapus data.");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
        <Link href="/more" className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-none transition-colors active:translate-y-1.5 active:translate-x-1.5 active:shadow-none">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-[20px] font-semibold ml-2">Pengaturan Aplikasi</h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        <div className="bg-surface border-[3px] border-black rounded-none overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-5 border-b-[3px] border-black flex items-center justify-between">
            <div className="flex items-center gap-4 text-text-main">
              <Moon size={22} className="text-text-secondary" />
              <span className="font-semibold text-[16px]">Mode Gelap</span>
            </div>
            <span className="text-[13px] font-medium text-text-secondary">Ikut Sistem</span>
          </div>
          
          <div className="p-5 border-b-[3px] border-black flex items-center justify-between">
            <div className="flex items-center gap-4 text-text-main">
              <Database size={22} className="text-text-secondary" />
              <span className="font-semibold text-[16px]">Pencadangan Data</span>
            </div>
            <span className="text-[13px] text-primary font-semibold">Segera Hadir</span>
          </div>

          <button 
            onClick={handleResetData}
            className="w-full p-5 flex items-center gap-4 text-expense hover:bg-expense/5 active:translate-y-1.5 active:translate-x-1.5 active:shadow-none transition-all duration-200 text-left"
          >
            <Trash2 size={22} />
            <div className="flex flex-col">
              <span className="font-semibold text-[16px]">Hapus Semua Data</span>
              <span className="text-[13px] font-medium opacity-80 mt-0.5">Mengembalikan aplikasi ke kondisi awal</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
