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
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const advancedFeatures = [
    { icon: PiggyBank, label: "Tabungan", href: "/savings", color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
    { icon: CreditCard, label: "Hutang & Piutang", href: "/debts", color: "text-red-500", bg: "bg-red-100 dark:bg-red-500/20" },
    { icon: Landmark, label: "Aset & Investasi", href: "/assets", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
        <h1 className="text-[24px] font-bold ml-1">Menu Lainnya</h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Analytics */}
        <div className="space-y-2">
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-2">Analisis & Laporan</h2>
          <div className="bg-surface border-[3px] border-black rounded-none overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Link 
              href="/reports"
              className="flex items-center justify-between p-4 hover:bg-border-subtle/50 active:translate-y-1.5 active:translate-x-1.5 active:shadow-none transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-none bg-purple-100/50 text-purple-600 dark:bg-purple-900/30">
                  <PieChart size={22} strokeWidth={2} />
                </div>
                <span className="font-semibold text-[16px]">Laporan Bulanan</span>
              </div>
              <ChevronRight size={20} className="text-text-secondary" />
            </Link>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="space-y-2">
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-2">Fitur Lanjutan</h2>
          <div className="bg-surface border-[3px] border-black rounded-none overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {advancedFeatures.map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                className={`flex items-center justify-between p-4 hover:bg-border-subtle/50 active:translate-y-1.5 active:translate-x-1.5 active:shadow-none transition-all duration-200 ${
                  i !== advancedFeatures.length - 1 ? 'border-b-[3px] border-black' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-none ${item.bg} ${item.color}`}>
                    <item.icon size={22} strokeWidth={2} />
                  </div>
                  <span className="font-semibold text-[16px]">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-text-secondary" />
              </Link>
            ))}
          </div>
        </div>

        {/* Data Portability */}
        <div className="space-y-2">
          <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-2">Pengaturan & Data</h2>
          <div className="bg-surface border-[3px] border-black rounded-none overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 hover:bg-border-subtle/50 active:translate-y-1.5 active:translate-x-1.5 active:shadow-none transition-all duration-200 border-b-[3px] border-black text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-none bg-border-subtle/50 text-text-secondary">
                  <Download size={22} strokeWidth={2} />
                </div>
                <span className="font-semibold text-[16px]">Export Data (Backup)</span>
              </div>
            </button>
            
            <button 
              onClick={handleImportClick}
              className="w-full flex items-center justify-between p-4 hover:bg-border-subtle/50 active:translate-y-1.5 active:translate-x-1.5 active:shadow-none transition-all duration-200 border-b-[3px] border-black text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-none bg-border-subtle/50 text-text-secondary">
                  <Upload size={22} strokeWidth={2} />
                </div>
                <span className="font-semibold text-[16px]">Import Data (Restore)</span>
              </div>
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
              className="flex items-center justify-between p-4 hover:bg-border-subtle/50 active:translate-y-1.5 active:translate-x-1.5 active:shadow-none transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-none bg-border-subtle/50 text-text-secondary">
                  <Settings size={22} strokeWidth={2} />
                </div>
                <span className="font-semibold text-[16px]">Pengaturan Aplikasi</span>
              </div>
              <ChevronRight size={20} className="text-text-secondary" />
            </Link>
          </div>
        </div>

        <div className="text-center pt-8">
          <p className="text-[12px] font-medium text-text-secondary">Pundi App v0.1.0 - MVP</p>
        </div>
      </div>
    </div>
  );
}
