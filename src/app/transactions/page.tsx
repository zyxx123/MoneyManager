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
  const allTransactions = useLiveQuery(() => transactionService.getAll());

  // Filter transactions based on selected month
  const transactions = allTransactions?.filter(t => {
    const targetDate = parseISO(`${selectedMonth}-01`);
    return isSameMonth(t.date, targetDate);
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28">
      <header className="sticky top-0 z-10 flex flex-col p-4 bg-background/90 backdrop-blur-md border-b border-border/80 space-y-3">
        <div className="flex items-center">
          <Link href="/" className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main transition-colors active:scale-95">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-bold ml-3 tracking-tight">Semua Transaksi</h1>
        </div>
        
        {/* Filter Bulan & Tahun */}
        <div className="flex items-center gap-3 bg-surface rounded-2xl p-2 px-3 border border-border/80 shadow-sm">
          <label className="text-[12px] font-bold text-text-secondary">Periode:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[14px] font-semibold text-text-main cursor-pointer"
          />
        </div>
      </header>
      
      <div className="flex-1 p-4">
        <div className="bg-surface rounded-3xl border border-border/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] divide-y divide-border/50 overflow-hidden">
          {allTransactions === undefined ? (
            <div className="text-center text-xs text-text-secondary py-12">Memuat transaksi...</div>
          ) : transactions?.length === 0 ? (
            <div className="text-center text-xs text-text-secondary py-12">Tidak ada transaksi di bulan ini.</div>
          ) : (
            transactions?.map((t) => (
              <Link 
                href={`/transactions/${t.id}/edit`}
                key={t.id} 
                className="p-4 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.02] active:bg-black/[0.04] transition-colors block"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
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
                    <p className="font-semibold text-sm text-text-main capitalize leading-snug">
                      {t.type === 'transfer' ? 'Transfer Antar Dompet' : t.note || 'Transaksi'}
                    </p>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      {format(t.date, "d MMM yyyy", { locale: localeID })}
                    </p>
                  </div>
                </div>

                <div className={`font-bold text-sm text-right ${
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
