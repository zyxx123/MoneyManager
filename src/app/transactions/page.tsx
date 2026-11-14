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
      <header className="sticky top-0 z-10 flex flex-col p-4 bg-background/90 backdrop-blur-md border-b border-border/80 space-y-3">
        <div className="flex items-center">
          <Link href="/" className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main press-spring tap-pill">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-bold ml-3 tracking-tight">Semua Transaksi</h1>
        </div>
        
        {/* Filter Bulan & Tahun */}
        <div className="flex items-center gap-3 bg-surface rounded-2xl p-2 px-3 border border-border/80 shadow-fintech-sm">
          <label className="text-[12px] font-bold text-text-secondary">Periode:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[14px] font-semibold text-text-main cursor-pointer"
          />
        </div>

        {/* Filter Tabs (Semua, Pengeluaran, Pemasukan, Transfer) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-spring press-spring tap-pill whitespace-nowrap ${
                filterType === tab.id
                  ? "bg-[#083328] text-white dark:bg-[#A3F03A] dark:text-[#083328] shadow-sm"
                  : "bg-surface text-text-secondary hover:text-text-main border border-border/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>
      
      <div className="flex-1 p-4">
        <div className="bg-surface rounded-3xl border border-border/80 shadow-fintech divide-y divide-border/50 overflow-hidden">
          {allTransactions === undefined ? (
            <div className="text-center text-xs text-text-secondary py-12 animate-pulse">Memuat transaksi...</div>
          ) : transactions?.length === 0 ? (
            <div className="text-center text-xs text-text-secondary py-12 animate-fade-in">Tidak ada transaksi di periode ini.</div>
          ) : (
            transactions?.map((t, idx) => (
              <Link 
                href={`/transactions/${t.id}/edit`}
                key={t.id} 
                className={`p-4 flex items-center justify-between hover:bg-[#EBF7F2]/40 dark:hover:bg-white/[0.03] transition-colors block group stagger-${Math.min(idx + 1, 8)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-108 ${
                    t.type === 'income' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' 
                      : t.type === 'expense'
                      ? 'bg-red-50 text-red-500 dark:bg-red-950/40'
                      : 'bg-blue-50 text-blue-500 dark:bg-blue-950/40'
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
