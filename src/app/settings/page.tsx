"use client";

import { ArrowLeft, Trash2, Database, Moon, Sparkles, Key, Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { aiService } from "@/lib/services/aiService";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // AI Settings
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existingKey = aiService.getCustomApiKey();
    if (existingKey) {
      setApiKey(existingKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    aiService.setCustomApiKey(apiKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

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
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 animate-fade-in-up">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/80 backdrop-blur-xl">
        <Link href="/more" className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-text-secondary hover:text-text-main press-spring">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-[20px] font-bold ml-3 tracking-tight">Pengaturan Aplikasi</h1>
      </header>

      <div className="flex-1 p-4 space-y-3">
        <div className="bubble-item rounded-[24px] p-4 flex items-center justify-between card-smooth">
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
              className="text-xs font-semibold bg-surface-muted outline-none cursor-pointer border border-border/80 rounded-full px-3 py-1.5 appearance-none focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth"
            >
              <option value="light">Terang</option>
              <option value="dark">Gelap</option>
              <option value="system">Sistem</option>
            </select>
          )}
        </div>
        
        <div className="bubble-item rounded-[24px] p-4 flex items-center justify-between card-smooth">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-surface-muted text-text-secondary flex items-center justify-center">
              <Database size={18} />
            </div>
            <div>
              <span className="font-semibold text-sm text-text-main block">Penyimpanan Offline</span>
              <span className="text-xs text-text-secondary">Data aman tersimpan di perangkat</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-[#A3F03A] bg-[#083328]/10 dark:bg-white/10 px-3 py-1 rounded-full liquid-glass-pill">
            Aktif
          </span>
        </div>

        {/* AI Integration Settings */}
        <div className="bubble-card p-5 rounded-[28px] space-y-3.5 card-smooth">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#083328] to-[#14533F] text-[#A3F03A] flex items-center justify-center shadow-lime-glow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-text-main">Integrasi Pundi AI</h3>
                <span className="text-[11px] text-text-secondary">Model: irham-model-flash</span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#A3F03A] text-[#083328]">
              Active
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Key size={12} />
              <span>API Key Kustom (Opsional)</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan API Key dari chat.jenderalpanel.com..."
                className="w-full p-3 pr-10 bg-surface-muted border border-border/80 rounded-2xl outline-none text-xs text-text-main placeholder:text-text-secondary/60 focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main"
              >
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[10px] text-text-secondary leading-tight mt-1">
              Jika Anda sudah memasang <code className="font-mono text-[#083328] dark:text-[#A3F03A]">AI_API_KEY</code> di Environment Variables Vercel atau <code className="font-mono">.env.local</code>, bagian ini boleh dikosongkan.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSaveApiKey}
              className={`py-2 px-4 rounded-full font-bold text-xs flex items-center gap-1.5 transition-spring press-spring ${
                saveSuccess
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-[#083328] dark:bg-[#A3F03A] text-white dark:text-[#083328] shadow-sm"
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <span>Simpan Kunci</span>
              )}
            </button>
          </div>
        </div>

        <button 
          onClick={handleResetData}
          className="w-full bubble-item rounded-[24px] p-4 flex items-center gap-3.5 text-expense hover:bg-red-500/10 press-spring text-left card-smooth"
        >
          <div className="w-10 h-10 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center">
            <Trash2 size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-expense">Hapus Semua Data</span>
            <span className="text-xs text-text-secondary mt-0.5">Mengembalikan aplikasi ke kondisi awal</span>
          </div>
        </button>
      </div>
    </div>
  );
}
