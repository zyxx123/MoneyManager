"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { transactionService } from "@/lib/services/transactionService";
import { format, isSameMonth, parseISO } from "date-fns";
import { id as localeID } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TransactionsPage() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const allTransactions = useLiveQuery(() => transactionService.getAll());

  // Filter transactions based on selected month
  const transactions = allTransactions?.filter(t => {
    // selectedMonth is "YYYY-MM"
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
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
      <header className="sticky top-0 z-10 flex flex-col p-4 bg-surface/90 backdrop-blur-md border-b-2 border-black space-y-4">
        <div className="flex items-center">
          <Link href="/" className="p-2 -ml-2 text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors active:translate-y-1 active:translate-x-1 active:shadow-none">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-[20px] font-semibold ml-2">Semua Transaksi</h1>
        </div>
        
        {/* Filter Bulan & Tahun */}
        <div className="flex items-center gap-3">
          <label className="text-[14px] font-medium text-text-secondary">Pilih Periode:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 p-2 bg-border-subtle/30 border-2 border-black rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-[15px] font-medium transition-all duration-200"
          />
        </div>
      </header>
      
      <div className="flex-1 p-4">
        <div className="bg-surface border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {allTransactions === undefined ? (
            <div className="text-center text-[14px] text-text-secondary py-10">Memuat transaksi...</div>
          ) : transactions?.length === 0 ? (
            <div className="text-center text-[14px] text-text-secondary py-10">Tidak ada transaksi di bulan ini.</div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {transactions?.map((t) => (
                <Link 
                  href={`/transactions/${t.id}/edit`}
                  key={t.id} 
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors block"
                >
                  <div>
                    <p className="font-medium text-[15px] text-text-main capitalize">
                      {t.type === 'transfer' ? 'Transfer' : t.note || 'Transaksi'}
                    </p>
                    <p className="text-[13px] text-text-secondary mt-0.5">
                      {format(t.date, "d MMM yyyy", { locale: localeID })}
                    </p>
                  </div>
                  <div className={`font-semibold text-[15px] ${
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
