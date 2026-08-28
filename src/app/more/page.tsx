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
    <div className="p-4 max-w-md mx-auto space-y-6 pt-8 pb-24 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Menu Lainnya</h1>

      {/* Analytics */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pl-2">Analisis & Laporan</h2>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <Link 
            href="/reports"
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30">
                <PieChart size={20} />
              </div>
              <span className="font-medium">Laporan Bulanan</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pl-2">Fitur Lanjutan</h2>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          {advancedFeatures.map((item, i) => (
            <Link 
              key={i} 
              href={item.href}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                i !== advancedFeatures.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${item.bg} ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Data Portability */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pl-2">Pengaturan & Data</h2>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <Download size={20} />
              </div>
              <span className="font-medium">Export Data (Backup)</span>
            </div>
          </button>
          
          <button 
            onClick={handleImportClick}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <Upload size={20} />
              </div>
              <span className="font-medium">Import Data (Restore)</span>
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
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                <Settings size={20} />
              </div>
              <span className="font-medium">Pengaturan Aplikasi</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </Link>
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-xs text-gray-400">Pundi App v0.1.0 - MVP</p>
      </div>
    </div>
  );
}
