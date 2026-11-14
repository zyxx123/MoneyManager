"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, PieChart, ArrowDownLeft, ArrowUpRight } from "lucide-react";
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
    return <div className="p-8 max-w-md mx-auto pt-16 flex justify-center text-xs text-text-secondary animate-pulse">Memuat laporan...</div>;
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
        color: cat?.color || "#10b981",
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 animate-fade-in-up">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/80 backdrop-blur-xl">
        <Link href="/more" className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-text-secondary hover:text-text-main press-spring">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-[20px] font-bold ml-3 tracking-tight">Laporan Bulan Ini</h1>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {/* Cashflow Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bubble-card p-4.5 rounded-[26px] card-smooth press-spring">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform hover:scale-110">
                <ArrowDownLeft size={16} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-medium text-text-secondary">Pemasukan</span>
            </div>
            <p className="font-bold text-income text-[17px] tracking-tight">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="bubble-card p-4.5 rounded-[26px] card-smooth press-spring">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-500/15 text-red-500 dark:text-red-400 flex items-center justify-center transition-transform hover:scale-110">
                <ArrowUpRight size={16} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-medium text-text-secondary">Pengeluaran</span>
            </div>
            <p className="font-bold text-expense text-[17px] tracking-tight">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
        
        {/* Net Surplus Card */}
        <div className="bubble-card p-5 rounded-[26px] card-smooth flex justify-between items-center">
          <div>
            <span className="text-xs font-medium text-text-secondary">Sisa / Surplus Bulanan</span>
            <p className={`font-bold text-xl tracking-tight mt-0.5 transition-colors ${totalIncome - totalExpense >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(totalIncome - totalExpense)}
            </p>
          </div>
          <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors ${
            totalIncome - totalExpense >= 0 
              ? 'bg-[#083328]/10 text-[#083328] dark:bg-white/10 dark:text-[#A3F03A] liquid-glass-pill' 
              : 'bg-red-500/15 text-red-600'
          }`}>
            {totalIncome - totalExpense >= 0 ? 'Surplus' : 'Defisit'}
          </span>
        </div>

        {/* Category Breakdown */}
        <div className="pt-2">
          <h2 className="text-[17px] font-bold text-text-main mb-3.5 flex items-center gap-2 tracking-tight">
            <PieChart size={18} className="text-[#083328] dark:text-[#A3F03A]" /> 
            <span>Pengeluaran per Kategori</span>
          </h2>
          
          {categoryBreakdown.length === 0 ? (
            <div className="bubble-card p-8 text-center animate-fade-in">
              <p className="text-text-secondary text-sm">Belum ada pengeluaran bulan ini.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Stacked bar */}
              <div className="h-3 w-full bg-surface-muted rounded-full overflow-hidden flex shadow-inner p-0.5">
                {categoryBreakdown.map(cat => (
                  <div 
                    key={cat.id} 
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} 
                    className="h-full rounded-full border-r border-background/40 last:border-0 hover:opacity-85 transition-all duration-700 ease-out"
                    title={`${cat.name}: ${cat.percentage.toFixed(1)}%`}
                  />
                ))}
              </div>
              
              <div className="space-y-2.5">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={cat.id} className={`bubble-item p-4 rounded-[22px] flex items-center justify-between card-smooth group stagger-${Math.min(idx + 1, 8)}`}>
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-108" style={{ backgroundColor: cat.color }}>
                        <DynamicIcon name={cat.icon} size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-text-main group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">{cat.name}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{cat.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-text-main tracking-tight transition-transform group-hover:scale-105">
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
