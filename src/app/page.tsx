"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { walletService } from "@/lib/services/walletService";
import { transactionService } from "@/lib/services/transactionService";
import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { id as localeID } from "date-fns/locale";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Home() {
  const wallets = useLiveQuery(() => walletService.getAllActive());
  const transactions = useLiveQuery(() => transactionService.getRecent(5));
  const currentMonthTransactions = useLiveQuery(async () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return db.transactions
      .where('date')
      .between(start, end, true, true)
      .toArray();
  });

  const totalBalance = wallets
    ?.filter(w => w.type !== 'savings')
    .reduce((sum, w) => sum + w.cachedBalance, 0) ?? 0;

  const monthlyIncome = currentMonthTransactions
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  const monthlyExpense = currentMonthTransactions
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0) ?? 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const [showBalance, setShowBalance] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("showBalance");
    if (saved !== null) {
      setShowBalance(saved === "true");
    }
  }, []);

  const toggleShowBalance = () => {
    const next = !showBalance;
    setShowBalance(next);
    localStorage.setItem("showBalance", String(next));
  };

  const displayAmount = (amount: number, prefix: string = '') => {
    if (!showBalance) return `${prefix}Rp •••••`;
    return `${prefix}${formatCurrency(amount)}`;
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pt-6 pb-20">
      {/* Total Balance Card */}
      <div className="bg-primary rounded-2xl p-6 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black relative overflow-hidden">
        {/* Subtle decorative circle */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-black/5 rounded-2xl blur-2xl"></div>
        <div className="flex justify-between items-center relative z-10 mb-1">
          <p className="text-black/80 text-sm font-medium">Total Saldo</p>
          <button 
            onClick={toggleShowBalance}
            className="text-black/80 hover:text-black p-1 rounded-lg hover:bg-black/10 transition-colors active:scale-95"
          >
            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        <div className="text-3xl font-bold tracking-tight relative z-10">
          {wallets === undefined ? "Menghitung..." : displayAmount(totalBalance)}
        </div>
      </div>

      {/* Income & Expense Summary */}
      <div className="grid grid-cols-2 gap-3 mt-8">
        <div className="relative pt-3">
          {/* Folder Tab */}
          <div className="absolute top-0 left-3 w-16 h-6 bg-income border-[3px] border-black rounded-t-xl z-0"></div>
          {/* Main Card */}
          <div className="relative z-10 bg-surface border-[3px] border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col justify-between">
            <div className="w-10 h-10 bg-income border-[3px] border-black rounded-xl flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div>
              <p className="text-xs font-bold mb-1">Pemasukan</p>
              <p className="font-black text-sm truncate">{currentMonthTransactions === undefined ? "..." : displayAmount(monthlyIncome)}</p>
            </div>
          </div>
        </div>

        <div className="relative pt-3">
          {/* Folder Tab */}
          <div className="absolute top-0 left-3 w-16 h-6 bg-expense border-[3px] border-black rounded-t-xl z-0"></div>
          {/* Main Card */}
          <div className="relative z-10 bg-surface border-[3px] border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col justify-between">
            <div className="w-10 h-10 bg-expense border-[3px] border-black rounded-xl flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <p className="text-xs font-bold mb-1">Pengeluaran</p>
              <p className="font-black text-sm truncate">{currentMonthTransactions === undefined ? "..." : displayAmount(monthlyExpense)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h2 className="text-[18px] font-bold text-text-main">Transaksi Terakhir</h2>
          <Link href="/transactions" className="text-[14px] text-primary font-medium hover:opacity-80 transition-opacity">
            Lihat Semua
          </Link>
        </div>
        
        <div className="bg-surface border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {transactions === undefined ? (
            <div className="text-center text-sm text-text-secondary py-8">Memuat transaksi...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-sm text-text-secondary py-8">Belum ada transaksi.</div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {transactions.map((t) => (
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
                  <div className={`font-bold text-[15px] ${
                    t.type === 'income' ? 'text-income' : 
                    t.type === 'expense' ? 'text-text-main' : 'text-text-secondary'
                  }`}>
                    {displayAmount(t.amount, t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '')}
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
