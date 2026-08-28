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
    <div className="p-4 max-w-md mx-auto space-y-6 pt-8">
      {/* Total Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg">
        <h2 className="text-blue-100 font-medium mb-1">Total Saldo</h2>
        <div className="text-3xl font-bold tracking-tight">
          {wallets === undefined ? "Menghitung..." : formatCurrency(totalBalance)}
        </div>
      </div>

      {/* Income & Expense Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Pemasukan Bulan Ini</p>
          <p className="font-semibold text-green-600">{currentMonthTransactions === undefined ? "..." : formatCurrency(monthlyIncome)}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Pengeluaran Bulan Ini</p>
          <p className="font-semibold text-red-600">{currentMonthTransactions === undefined ? "..." : formatCurrency(monthlyExpense)}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold">Transaksi Terakhir</h2>
          <Link href="/transactions" className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</Link>
        </div>
        
        <div className="space-y-3">
          {transactions === undefined ? (
            <div className="text-center text-sm text-gray-500 py-8">Memuat transaksi...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8">Belum ada transaksi.</div>
          ) : (
            transactions.map((t) => (
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
    </div>
  );
}
