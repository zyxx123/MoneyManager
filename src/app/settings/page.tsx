"use client";

import { ArrowLeft, Trash2, Database, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
        <Link href="/more" className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main transition-colors active:scale-95">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-[20px] font-bold ml-3 tracking-tight">Pengaturan Aplikasi</h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        <div className="bg-surface rounded-3xl border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] divide-y divide-border/50 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-surface-muted text-text-secondary flex items-center justify-center">
                <Moon size={18} />
              </div>
              <div>
                <span className="font-semibold text-sm text-text-main block">Tema Tampilan</span>
                <span className="text-xs text-text-secondary">Pilih mode warna aplikasi</span>
              </div>
            </div>
            {mounted && (
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="text-xs font-semibold bg-surface-muted outline-none cursor-pointer border border-border/80 rounded-full px-3 py-1.5 appearance-none focus:ring-2 focus:ring-[#A3F03A]"
              >
                <option value="light">Terang</option>
                <option value="dark">Gelap</option>
                <option value="system">Sistem</option>
              </select>
            )}
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-surface-muted text-text-secondary flex items-center justify-center">
                <Database size={18} />
              </div>
              <div>
                <span className="font-semibold text-sm text-text-main block">Penyimpanan Offline</span>
                <span className="text-xs text-text-secondary">Data aman tersimpan di perangkat</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-[#A3F03A] bg-[#EBF7F2] dark:bg-[#14382E] px-2.5 py-0.5 rounded-full">
              Aktif
            </span>
          </div>

          <button 
            onClick={handleResetData}
            className="w-full p-4 flex items-center gap-3.5 text-expense hover:bg-red-50/50 dark:hover:bg-red-950/20 active:scale-[0.99] transition-all text-left"
          >
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
              <Trash2 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-expense">Hapus Semua Data</span>
              <span className="text-xs text-text-secondary mt-0.5">Mengembalikan aplikasi ke kondisi awal</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
