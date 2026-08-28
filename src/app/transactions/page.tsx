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
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 dark:bg-gray-950">
      <header className="flex flex-col p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex items-center">
          <Link href="/" className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold ml-2">Semua Transaksi</h1>
        </div>
        
        {/* Filter Bulan & Tahun */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Pilih Periode:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
          />
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {allTransactions === undefined ? (
          <div className="text-center text-sm text-gray-500 py-8">Memuat transaksi...</div>
        ) : transactions?.length === 0 ? (
          <div className="text-center text-sm text-gray-500 py-8">Tidak ada transaksi di bulan ini.</div>
        ) : (
          transactions?.map((t) => (
            <Link 
              href={`/transactions/${t.id}/edit`}
              key={t.id} 
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-blue-200 dark:hover:border-blue-900 transition-colors cursor-pointer block"
            >
              <div>
                <p className="font-medium capitalize">{t.type === 'transfer' ? 'Transfer' : t.note || 'Transaksi'}</p>
                <p className="text-xs text-gray-500">{format(t.date, "d MMM yyyy", { locale: localeID })}</p>
              </div>
              <div className={`font-bold ${
                t.type === 'income' ? 'text-green-600' : 
                t.type === 'expense' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500'
              }`}>
                {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}
                {formatCurrency(t.amount)}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
