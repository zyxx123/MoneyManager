"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, PieChart } from "lucide-react";
import Link from "next/link";
import { startOfMonth, endOfMonth } from "date-fns";
import { DynamicIcon } from "@/components/DynamicIcon";

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
        icon: cat?.icon || "shopping-cart",
        color: cat?.color || "#6b7280",
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
        <Link href="/more" className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-full transition-colors active:scale-95">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-[20px] font-semibold ml-2">Laporan Bulan Ini</h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Cashflow Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-[24px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border-subtle">
            <p className="text-[13px] font-medium text-text-secondary mb-2">Pemasukan</p>
            <p className="font-bold text-income text-[17px] tracking-tight">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="bg-surface rounded-[24px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border-subtle">
            <p className="text-[13px] font-medium text-text-secondary mb-2">Pengeluaran</p>
            <p className="font-bold text-expense text-[17px] tracking-tight">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        
        <div className="bg-surface rounded-[24px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border-subtle flex justify-between items-center">
          <span className="text-[15px] font-medium text-text-secondary">Sisa / Surplus</span>
          <span className={`font-bold text-[17px] tracking-tight ${totalIncome - totalExpense >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(totalIncome - totalExpense)}
          </span>
        </div>

        {/* Category Breakdown */}
        <div className="pt-2">
          <h2 className="text-[18px] font-semibold mb-5 flex items-center gap-2">
            <PieChart size={20} className="text-primary" /> Kategori Pengeluaran
          </h2>
          
          {categoryBreakdown.length === 0 ? (
            <div className="bg-surface rounded-[24px] border border-border-subtle p-8 text-center">
              <p className="text-text-secondary font-medium">Belum ada pengeluaran bulan ini.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Pseudo-chart (horizontal stacked bar) */}
              <div className="h-3 w-full bg-border-subtle/50 rounded-full overflow-hidden flex shadow-inner">
                {categoryBreakdown.map(cat => (
                  <div 
                    key={cat.id} 
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} 
                    className="h-full border-r border-background/50 last:border-0 hover:opacity-80 transition-opacity"
                    title={`${cat.name}: ${cat.percentage.toFixed(1)}%`}
                  />
                ))}
              </div>
              
              <div className="bg-surface rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-border-subtle overflow-hidden">
                {categoryBreakdown.map((cat, i) => (
                  <div key={cat.id} className={`flex items-center justify-between p-4 ${i !== categoryBreakdown.length - 1 ? 'border-b border-border-subtle' : ''} hover:bg-border-subtle/20 transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-inner" style={{ backgroundColor: cat.color }}>
                        <DynamicIcon name={cat.icon} size={18} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-[15px] text-text-main">{cat.name}</p>
                        <p className="text-[13px] font-medium text-text-secondary mt-0.5">{cat.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <span className="font-semibold text-[15px] text-text-main tracking-tight">
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
