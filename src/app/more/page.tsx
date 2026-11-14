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
  PieChart
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
      } catch (e) {
        alert("Gagal melakukan import data. Pastikan file valid.");
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
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
        <h1 className="text-[22px] font-bold ml-1 tracking-tight">Menu Lainnya</h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Analytics */}
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider ml-1">Analisis & Laporan</h2>
          <div className="bg-surface rounded-3xl border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
            <Link 
              href="/reports"
              className="flex items-center justify-between p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF7F2] dark:bg-[#14382E] text-[#083328] dark:text-[#A3F03A] flex items-center justify-center">
                  <PieChart size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="font-semibold text-sm text-text-main block">Laporan Bulanan</span>
                  <span className="text-xs text-text-secondary">Statistik arus kas & grafik kategori</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary/60" />
            </Link>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider ml-1">Fitur Keuangan</h2>
          <div className="bg-surface rounded-3xl border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] divide-y divide-border/50 overflow-hidden">
            {advancedFeatures.map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                className="flex items-center justify-between p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${item.bg} ${item.color}`}>
                    <item.icon size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-text-main block">{item.label}</span>
                    <span className="text-xs text-text-secondary">{item.desc}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-text-secondary/60" />
              </Link>
            ))}
          </div>
        </div>

        {/* Data Portability */}
        <div className="space-y-2">
          <h2 className="text-[12px] font-bold text-text-secondary uppercase tracking-wider ml-1">Penyimpanan & Pengaturan</h2>
          <div className="bg-surface rounded-3xl border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] divide-y divide-border/50 overflow-hidden">
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-muted text-text-secondary flex items-center justify-center">
                  <Download size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="font-semibold text-sm text-text-main block">Export Data (Backup)</span>
                  <span className="text-xs text-text-secondary">Simpan file JSON cadangan lokal</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary/60" />
            </button>
            
            <button 
              onClick={handleImportClick}
              className="w-full flex items-center justify-between p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-muted text-text-secondary flex items-center justify-center">
                  <Upload size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="font-semibold text-sm text-text-main block">Import Data (Restore)</span>
                  <span className="text-xs text-text-secondary">Pulihkan data dari cadangan</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary/60" />
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
              className="flex items-center justify-between p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-surface-muted text-text-secondary flex items-center justify-center">
                  <Settings size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="font-semibold text-sm text-text-main block">Pengaturan Aplikasi</span>
                  <span className="text-xs text-text-secondary">Tema tampilan & reset sistem</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-secondary/60" />
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
