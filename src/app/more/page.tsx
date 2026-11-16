"use client";

import Link from "next/link";
import { useRef } from "react";
import { 
  PiggyBank, 
  CreditCard, 
  Landmark, 
  Settings, 
  Download, 
  Upload, 
  ChevronRight, 
  PieChart,
  Sparkles 
} from "lucide-react";
import { dataService } from "@/lib/services/dataService";

export default function MorePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      const blob = await dataService.exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pundi-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Gagal export data!");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("Peringatan: Semua data yang ada saat ini akan ditimpa dengan data dari file backup. Lanjutkan?")) {
      try {
        await dataService.importData(file);
        alert("Import berhasil! Data telah dipulihkan.");
        window.location.reload();
      } catch (err: any) {
        alert(`Gagal melakukan import data: ${err?.message || "Pastikan file valid."}`);
      }
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const advancedFeatures = [
    { icon: PiggyBank, label: "Tabungan", desc: "Target menabung & simpanan", href: "/savings", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    { icon: CreditCard, label: "Hutang & Piutang", desc: "Catat pinjaman & tagihan", href: "/debts", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40" },
    { icon: Landmark, label: "Aset & Investasi", desc: "Pantau kekayaan bersih", href: "/assets", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 animate-fade-in-up">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/80 backdrop-blur-xl">
        <h1 className="text-[22px] font-bold ml-1 tracking-tight">Menu Lainnya</h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Pundi AI Feature */}
        <div className="space-y-2.5">
          <h2 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider ml-1">Kecerdasan Buatan (AI)</h2>
          <Link 
            href="/advisor"
            className="bubble-card rounded-[26px] p-4.5 flex items-center justify-between card-smooth press-spring block group relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#083328] to-[#14533F] text-[#A3F03A] flex items-center justify-center shadow-lime-glow-sm transition-transform duration-300 group-hover:scale-110">
                <Sparkles size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-text-main group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">Pundi AI Advisor</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#A3F03A] text-[#083328]">Flash</span>
                </div>
                <span className="text-xs text-text-secondary">Konsultasi keuangan pribadi & evaluasi budget</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-text-secondary/60 group-hover:translate-x-0.5 group-hover:text-text-main transition-transform" />
          </Link>
        </div>

        {/* Analytics */}
        <div className="space-y-2.5">
          <h2 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider ml-1">Analisis & Laporan</h2>
          <Link 
            href="/reports"
            className="bubble-item rounded-[24px] p-4 flex items-center justify-between card-smooth press-spring block group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#083328]/10 dark:bg-white/10 text-[#083328] dark:text-[#A3F03A] flex items-center justify-center transition-transform duration-300 group-hover:scale-108">
                <PieChart size={20} strokeWidth={2.2} />
              </div>
              <div>
                <span className="font-semibold text-sm text-text-main block group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">Laporan Bulanan</span>
                <span className="text-xs text-text-secondary">Statistik arus kas & grafik kategori</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-text-secondary/60 group-hover:translate-x-0.5 group-hover:text-text-main transition-transform" />
          </Link>
        </div>

        {/* Advanced Features */}
        <div className="space-y-2.5">
          <h2 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider ml-1">Fitur Keuangan</h2>
          <div className="space-y-2.5">
            {advancedFeatures.map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                className="bubble-item rounded-[24px] p-4 flex items-center justify-between card-smooth press-spring block group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} transition-transform duration-300 group-hover:scale-108`}>
                    <item.icon size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-text-main block group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">{item.label}</span>
                    <span className="text-xs text-text-secondary">{item.desc}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-text-secondary/60 group-hover:translate-x-0.5 group-hover:text-text-main transition-transform" />
              </Link>
            ))}
          </div>
        </div>

        {/* Data Portability */}
        <div className="space-y-2.5">
          <h2 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider ml-1">Penyimpanan & Pengaturan</h2>
          <div className="space-y-2.5">
            <button 
              onClick={handleExport}
              className="w-full bubble-item rounded-[24px] p-4 flex items-center justify-between card-smooth press-spring text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-muted text-text-secondary flex items-center justify-center transition-transform duration-300 group-hover:scale-108">
                  <Download size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="font-semibold text-sm text-text-main block group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">Export Data (Backup)</span>
                  <span className="text-xs text-text-secondary">Simpan file JSON cadangan lokal</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary/60 group-hover:translate-x-0.5 group-hover:text-text-main transition-transform" />
            </button>
            
            <button 
              onClick={handleImportClick}
              className="w-full bubble-item rounded-[24px] p-4 flex items-center justify-between card-smooth press-spring text-left group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-muted text-text-secondary flex items-center justify-center transition-transform duration-300 group-hover:scale-108">
                  <Upload size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="font-semibold text-sm text-text-main block group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">Import Data (Restore)</span>
                  <span className="text-xs text-text-secondary">Pulihkan data dari cadangan</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary/60 group-hover:translate-x-0.5 group-hover:text-text-main transition-transform" />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                className="hidden" 
              />
            </button>

            <Link 
              href="/settings"
              className="bubble-item rounded-[24px] p-4 flex items-center justify-between card-smooth press-spring block group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-muted text-text-secondary flex items-center justify-center transition-transform duration-300 group-hover:scale-108">
                  <Settings size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="font-semibold text-sm text-text-main block group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">Pengaturan Aplikasi</span>
                  <span className="text-xs text-text-secondary">Tema tampilan & reset sistem</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary/60 group-hover:translate-x-0.5 group-hover:text-text-main transition-transform" />
            </Link>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-[11px] text-text-secondary font-medium">Pundi Keuangan Pribadi • 100% Offline</p>
        </div>
      </div>
    </div>
  );
}
