"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, PieChart } from "lucide-react";
import Link from "next/link";
import { startOfMonth, endOfMonth } from "date-fns";

export default function ReportsPage() {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const transactions = useLiveQuery(() => 
    db.transactions.where('date').between(start, end, true, true).toArray()
  );

  const categories = useLiveQuery(() => db.categories.toArray());

  if (!transactions || !categories) {
    return <div className="p-4 max-w-md mx-auto pt-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full bg-blue-200"></div></div>;
  }

  // Calculate totals
  let totalIncome = 0;
  let totalExpense = 0;
  
  const expenseByCategory: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    if (t.type === 'expense') {
      totalExpense += t.amount;
      const catId = t.categoryId || 'unassigned';
      expenseByCategory[catId] = (expenseByCategory[catId] || 0) + t.amount;
    }
  });

  const categoryBreakdown = Object.entries(expenseByCategory)
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name: cat?.name || "Lainnya",
        icon: cat?.icon || "🛒",
        color: cat?.color || "#6b7280",
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Link href="/more" className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold ml-2">Laporan Bulan Ini</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Cashflow Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Total Pemasukan</p>
            <p className="font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 mb-1">Total Pengeluaran</p>
            <p className="font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <span className="text-sm font-medium">Net Income / Surplus</span>
          <span className={`font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </span>
        </div>

        {/* Category Breakdown */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-blue-500" /> Pengeluaran by Kategori
          </h2>
          
          {categoryBreakdown.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm">Belum ada pengeluaran bulan ini.</p>
          ) : (
            <div className="space-y-4">
              {/* Pseudo-chart (horizontal stacked bar) */}
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                {categoryBreakdown.map(cat => (
                  <div 
                    key={cat.id} 
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} 
                    className="h-full border-r border-white/20 last:border-0"
                    title={`${cat.name}: ${cat.percentage.toFixed(1)}%`}
                  />
                ))}
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-gray-800">
                {categoryBreakdown.map((cat, i) => (
                  <div key={cat.id} className={`flex items-center justify-between p-3 ${i !== categoryBreakdown.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm" style={{ backgroundColor: cat.color }}>
                        {cat.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{cat.name}</p>
                        <p className="text-xs text-gray-500">{cat.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
