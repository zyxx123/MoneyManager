"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { transactionService } from "@/lib/services/transactionService";
import { format, isSameMonth, parseISO } from "date-fns";
import { id as localeID } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, MoreVertical } from "lucide-react";

export default function TransactionsPage() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [filterType, setFilterType] = useState<"all" | "expense" | "income" | "transfer">("all");
  const allTransactions = useLiveQuery(() => transactionService.getAll());

  // Filter transactions based on selected month and type
  const transactions = allTransactions?.filter(t => {
    const targetDate = parseISO(`${selectedMonth}-01`);
    const matchesMonth = isSameMonth(t.date, targetDate);
    const matchesType = filterType === "all" || t.type === filterType;
    return matchesMonth && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filterTabs = [
    { id: "all", label: "Semua" },
    { id: "expense", label: "Pengeluaran" },
    { id: "income", label: "Pemasukan" },
    { id: "transfer", label: "Transfer" },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 animate-fade-in-up">
      <header className="sticky top-0 z-10 flex flex-col p-4 bg-background/80 backdrop-blur-xl space-y-3.5">
        <div className="flex items-center">
          <Link href="/" className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-text-secondary hover:text-text-main press-spring">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-[20px] font-bold ml-3 tracking-tight">Semua Transaksi</h1>
        </div>
        
        {/* Filter Bulan & Tahun */}
        <div className="flex items-center gap-3 bubble-item rounded-full px-4 py-2">
          <label className="text-[12px] font-bold text-text-secondary">Periode:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[14px] font-semibold text-text-main cursor-pointer"
          />
        </div>

        {/* Filter Tabs (Semua, Pengeluaran, Pemasukan, Transfer) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-spring press-spring whitespace-nowrap ${
                filterType === tab.id
                  ? "bg-[#083328] text-white dark:bg-[#A3F03A] dark:text-[#083328] shadow-sm"
                  : "liquid-glass-pill text-text-secondary hover:text-text-main"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      
      <div className="flex-1 p-4">
        <div>
          {allTransactions === undefined ? (
            <div className="text-center text-xs text-text-secondary py-12 animate-pulse bubble-card">Memuat transaksi...</div>
          ) : transactions?.length === 0 ? (
            <div className="text-center text-xs text-text-secondary py-12 animate-fade-in bubble-card">Tidak ada transaksi di periode ini.</div>
          ) : (
            <div className="space-y-2.5">
              {transactions?.map((t, idx) => (
                <Link 
                  href={`/transactions/${t.id}/edit`}
                  key={t.id} 
                  className={`bubble-item p-4 rounded-[22px] flex items-center justify-between card-smooth press-spring block group stagger-${Math.min(idx + 1, 8)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-108 ${
                      t.type === 'income' 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                        : t.type === 'expense'
                        ? 'bg-red-500/15 text-red-500 dark:text-red-400'
                        : 'bg-blue-500/15 text-blue-500 dark:text-blue-400'
                    }`}>
                      {t.type === 'income' ? (
                        <ArrowDownLeft size={18} strokeWidth={2.5} />
                      ) : t.type === 'expense' ? (
                        <ArrowUpRight size={18} strokeWidth={2.5} />
                      ) : (
                        <MoreVertical size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text-main capitalize leading-snug group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">
                        {t.type === 'transfer' ? 'Transfer Antar Dompet' : t.note || 'Transaksi'}
                      </p>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        {format(t.date, "d MMM yyyy", { locale: localeID })}
                      </p>
                    </div>
                  </div>

                  <div className={`font-bold text-sm text-right transition-transform group-hover:scale-105 ${
                    t.type === 'income' ? 'text-income' : 
                    t.type === 'expense' ? 'text-text-main' : 'text-text-secondary'
                  }`}>
                    {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                    {formatCurrency(t.amount)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
