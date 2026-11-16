"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, PieChart, ArrowDownLeft, ArrowUpRight, Sparkles, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { DynamicIcon } from "@/components/DynamicIcon";
import { aiService, type MonthlyHealthAnalysis } from "@/lib/services/aiService";
import { formatAiInline } from "@/components/FormattedAiText";

export default function ReportsPage() {
  const [analysis, setAnalysis] = useState<MonthlyHealthAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const transactions = useLiveQuery(() => 
    db.transactions.where('date').between(start, end, true, true).toArray()
  );

  const categories = useLiveQuery(() => db.categories.toArray());
  const savingsGoals = useLiveQuery(() => db.savingsGoals.toArray());
  const activeBudget = useLiveQuery(() => db.budgets.where("isActive").equals(1).first());

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

  const handleAnalyzeReport = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const monthLabel = format(now, "MMMM yyyy", { locale: localeID });
      const res = await aiService.analyzeMonthlyReport({
        month: monthLabel,
        totalIncome,
        totalExpense,
        categoryBreakdown: categoryBreakdown.map((c) => ({ name: c.name, amount: c.amount, percentage: c.percentage })),
        savingsGoals: savingsGoals?.map((s) => ({ name: s.name, target: s.targetAmount, current: s.currentAmount })),
        budgetSummary: activeBudget ? { name: activeBudget.name, amount: activeBudget.amount } : null,
      });

      setAnalysis(res);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "Gagal menganalisis laporan dengan AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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

        {/* AI Financial Health Analysis Section */}
        <div className="space-y-3">
          {!analysis && !isAnalyzing && (
            <button
              type="button"
              onClick={handleAnalyzeReport}
              className="w-full p-4 rounded-[26px] bubble-item flex items-center justify-between text-left group press-spring"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#083328] to-[#14533F] text-[#A3F03A] flex items-center justify-center shadow-lime-glow-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-main group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors flex items-center gap-1.5">
                    <span>Minta Analisis AI Bulan Ini</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#083328]/10 dark:bg-white/10 text-[#083328] dark:text-[#A3F03A]">
                      Flash
                    </span>
                  </h3>
                  <p className="text-xs text-text-secondary">Evaluasi skor kesehatan & saran penghematan</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-text-secondary/60 group-hover:translate-x-0.5 group-hover:text-text-main transition-transform" />
            </button>
          )}

          {isAnalyzing && (
            <div className="bubble-card p-6 rounded-[28px] text-center space-y-3 animate-fade-in">
              <Loader2 size={28} className="animate-spin text-[#083328] dark:text-[#A3F03A] mx-auto" />
              <p className="font-bold text-sm text-text-main">AI sedang menganalisis kesehatan keuanganmu...</p>
              <p className="text-xs text-text-secondary">Memeriksa arus kas, kategori pengeluaran, dan target tabungan</p>
            </div>
          )}

          {analysisError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
              {analysisError}
            </div>
          )}

          {analysis && (
            <div className="bubble-card p-6 rounded-[30px] space-y-4 animate-fade-in relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#083328] dark:text-[#A3F03A]" />
                    <span>Skor Kesehatan Finansial</span>
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-text-main tracking-tight">
                      {analysis.healthScore}
                    </span>
                    <span className="text-sm font-semibold text-text-secondary">/ 100</span>
                  </div>
                </div>

                <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-sm ${
                  analysis.healthScore >= 80
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : analysis.healthScore >= 60
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-red-500/15 text-red-500 border border-red-500/20"
                }`}>
                  {analysis.status}
                </span>
              </div>

              {/* Summary */}
              <p className="text-xs text-text-main leading-relaxed bg-black/5 dark:bg-white/5 p-3 rounded-2xl">
                {formatAiInline(analysis.summary)}
              </p>

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                    Kebiasaan Baik
                  </span>
                  <ul className="space-y-1">
                    {analysis.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-text-main">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{formatAiInline(s)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concerns */}
              {analysis.concerns && analysis.concerns.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                    Perlu Diwaspadai
                  </span>
                  <ul className="space-y-1">
                    {analysis.concerns.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-text-main">
                        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{formatAiInline(c)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-black/5 dark:border-white/5 pt-3">
                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block">
                    Rekomendasi Langkah Nyata
                  </span>
                  <ul className="space-y-1.5">
                    {analysis.recommendations.map((r, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-text-main bg-[#083328]/5 dark:bg-white/5 p-2 rounded-xl">
                        <span className="w-4 h-4 rounded-full bg-[#083328] dark:bg-[#A3F03A] text-white dark:text-[#083328] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{formatAiInline(r)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chat with advisor CTA */}
              <div className="pt-2">
                <Link
                  href="/advisor"
                  className="w-full py-2.5 px-4 rounded-full liquid-glass-pill font-bold text-xs text-[#083328] dark:text-[#A3F03A] flex items-center justify-center gap-1.5 press-spring"
                >
                  <Sparkles size={14} />
                  <span>Diskusikan Lebih Lanjut dengan Pundi AI</span>
                </Link>
              </div>
            </div>
          )}
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
