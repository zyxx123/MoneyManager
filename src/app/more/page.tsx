"use client";

import Link from "next/link";
import { 
  PiggyBank, 
  CreditCard, 
  Landmark, 
  Settings, 
  Download,
  Upload,
  ChevronRight
} from "lucide-react";

export default function MorePage() {
  const menuGroups = [
    {
      title: "Fitur Lanjutan",
      items: [
        { icon: PiggyBank, label: "Tabungan", href: "/savings", color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" },
        { icon: CreditCard, label: "Hutang & Piutang", href: "/debts", color: "text-red-500", bg: "bg-red-100 dark:bg-red-500/20" },
        { icon: Landmark, label: "Aset & Investasi", href: "/assets", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" },
      ]
    },
    {
      title: "Pengaturan & Data",
      items: [
        { icon: Download, label: "Export Data (CSV)", href: "#", color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-200 dark:bg-gray-800" },
        { icon: Upload, label: "Import Data", href: "#", color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-200 dark:bg-gray-800" },
        { icon: Settings, label: "Pengaturan Aplikasi", href: "/settings", color: "text-gray-700 dark:text-gray-300", bg: "bg-gray-200 dark:bg-gray-800" },
      ]
    }
  ];

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pt-8 pb-24 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Menu Lainnya</h1>

      {menuGroups.map((group, idx) => (
        <div key={idx} className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pl-2">
            {group.title}
          </h2>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            {group.items.map((item, i) => (
              <Link 
                key={i} 
                href={item.href}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  i !== group.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
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
      ))}

      <div className="text-center pt-8">
        <p className="text-xs text-gray-400">Pundi App v0.1.0 - MVP</p>
      </div>
    </div>
  );
}
