"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { walletService } from "@/lib/services/walletService";
import { transactionService } from "@/lib/services/transactionService";
import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { id as localeID } from "date-fns/locale";
import Link from "next/link";

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

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pt-6 pb-20">
      {/* Total Balance Card */}
      <div className="bg-primary rounded-none p-6 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black relative overflow-hidden">
        {/* Subtle decorative circle */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-none blur-2xl"></div>
        <p className="text-white/80 text-sm font-medium mb-1 relative z-10">Total Saldo</p>
        <div className="text-3xl font-bold tracking-tight relative z-10">
          {wallets === undefined ? "Menghitung..." : formatCurrency(totalBalance)}
        </div>
      </div>

      {/* Income & Expense Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface border-[3px] border-black rounded-none p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs text-text-secondary font-medium mb-1">Pemasukan</p>
          <p className="font-semibold text-income">{currentMonthTransactions === undefined ? "..." : formatCurrency(monthlyIncome)}</p>
        </div>
        <div className="bg-surface border-[3px] border-black rounded-none p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xs text-text-secondary font-medium mb-1">Pengeluaran</p>
          <p className="font-semibold text-expense">{currentMonthTransactions === undefined ? "..." : formatCurrency(monthlyExpense)}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-3 px-1">
          <h2 className="text-[18px] font-semibold text-text-main">Transaksi Terakhir</h2>
          <Link href="/transactions" className="text-[14px] text-primary font-medium hover:opacity-80 transition-opacity">
            Lihat Semua
          </Link>
        </div>
        
        <div className="bg-surface border-[3px] border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
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
