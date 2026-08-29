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
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Link href="/more" className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold ml-2">Pengaturan Aplikasi</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Moon size={20} />
              <span className="font-medium">Mode Gelap</span>
            </div>
            <span className="text-xs text-gray-400">Ikut Sistem</span>
          </div>
          
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Database size={20} />
              <span className="font-medium">Pencadangan Data</span>
            </div>
            <span className="text-xs text-blue-500 font-medium">Segera Hadir</span>
          </div>

          <button 
            onClick={handleResetData}
            className="w-full p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
          >
            <Trash2 size={20} />
            <div className="flex flex-col">
              <span className="font-medium">Hapus Semua Data</span>
              <span className="text-xs text-red-400">Mengembalikan aplikasi ke kondisi awal</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
