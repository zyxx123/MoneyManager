"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { walletService } from "@/lib/services/walletService";
import { transactionService } from "@/lib/services/transactionService";
import { budgetService } from "@/lib/services/budgetService";
import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { id as localeID } from "date-fns/locale";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Eye, 
  EyeOff, 
  Moon, 
  Sun, 
  ArrowDownLeft, 
  ArrowUpRight, 
  MoreVertical,
  Wallet,
  CreditCard,
  PieChart,
  BarChart3,
  PiggyBank,
  HandCoins,
  Landmark,
  Settings,
  ChevronRight,
  Hexagon,
  Sparkles
} from "lucide-react";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("showBalance");
    if (saved !== null) {
      setShowBalance(saved === "true");
    }
  }, []);

  const wallets = useLiveQuery(() => walletService.getAllActive());
  const transactions = useLiveQuery(() => transactionService.getRecent(5));
  const budgetStatus = useLiveQuery(() => budgetService.getDailyLimitStatus());

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

  const toggleShowBalance = () => {
    const next = !showBalance;
    setShowBalance(next);
    localStorage.setItem("showBalance", String(next));
  };

  const displayAmount = (amount: number, prefix: string = '') => {
    if (!showBalance) return `${prefix}Rp •••••`;
    return `${prefix}${formatCurrency(amount)}`;
  };

  // Determine greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const categoriesGrid = [
    { label: "Wallet", sublabel: "Dompet", icon: Wallet, href: "/wallets" },
    { label: "Payments", sublabel: "Transaksi", icon: CreditCard, href: "/transactions" },
    { label: "Budget", sublabel: "Budgeting", icon: PieChart, href: "/budget" },
    { label: "Reports", sublabel: "Laporan", icon: BarChart3, href: "/reports" },
    { label: "Savings", sublabel: "Tabungan", icon: PiggyBank, href: "/savings" },
    { label: "Debts", sublabel: "Hutang", icon: HandCoins, href: "/debts" },
    { label: "Assets", sublabel: "Aset", icon: Landmark, href: "/assets" },
    { label: "Settings", sublabel: "Pengaturan", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
      {/* Top Header - Deep Forest Green */}
      <div className="bg-[#083328] text-white pt-6 pb-12 px-5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#A3F03A]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-20 -left-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* User Greeting & Top Controls */}
        <div className="flex justify-between items-center relative z-10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#A3F03A]/40 flex items-center justify-center text-[#A3F03A] shadow-inner">
              <Hexagon size={24} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-white/60 text-xs font-normal">{getGreeting()}</p>
              <h1 className="text-white font-bold text-base tracking-tight leading-tight">Pundi Keuangan</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle Theme"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
              >
                {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </button>
            )}
            <button
              onClick={toggleShowBalance}
              aria-label="Toggle Balance Visibility"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
            >
              {showBalance ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="relative z-10 mb-6">
          <div className="flex justify-between items-center mb-1">
            <p className="text-white/70 text-xs font-normal tracking-wide">Total Balance</p>
            <div className="bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full text-[11px] text-white/90 flex items-center gap-1 font-medium">
              <span>IDR</span>
              <span className="text-[9px] opacity-70">▾</span>
            </div>
          </div>
          <div className="text-[34px] font-bold text-white tracking-tight">
            {wallets === undefined ? "Menghitung..." : displayAmount(totalBalance)}
          </div>
        </div>

        {/* Action Buttons (Request, Transfer, More) */}
        <div className="flex items-center gap-2.5 relative z-10">
          <Link
            href="/transactions/new?type=income"
            className="flex-1 py-3 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all backdrop-blur-sm"
          >
            <ArrowDownLeft size={16} strokeWidth={2.5} className="text-[#A3F03A]" />
            <span>Request</span>
          </Link>

          <Link
            href="/transactions/new?type=expense"
            className="flex-1 py-3 px-4 rounded-full bg-[#A3F03A] hover:bg-[#92dc2f] text-[#083328] font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(163,240,58,0.35)] active:scale-95 transition-all"
          >
            <ArrowUpRight size={16} strokeWidth={2.5} />
            <span>Transfer</span>
          </Link>

          <Link
            href="/transactions/new?type=transfer"
            aria-label="Transfer Antar Dompet"
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white flex items-center justify-center active:scale-95 transition-all"
          >
            <MoreVertical size={18} />
          </Link>
        </div>
      </div>

      {/* Main Curved White Sheet */}
      <div className="rounded-t-[36px] bg-background pt-6 px-4 pb-12 -mt-6 shadow-2xl relative z-10 space-y-6">
        {/* Categories Card (4x2 Grid) */}
        <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <h2 className="text-text-main font-bold text-base mb-4 tracking-tight">Categories</h2>
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
            {categoriesGrid.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="group flex flex-col items-center transition-transform active:scale-95"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EBF7F2] dark:bg-[#14382E] text-[#083328] dark:text-[#A3F03A] flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-all duration-200">
                  <item.icon size={22} strokeWidth={2.2} />
                </div>
                <span className="text-[12px] font-semibold text-text-main leading-tight">{item.label}</span>
                <span className="text-[10px] text-text-secondary opacity-75">{item.sublabel}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Card - Daily Spending Limit (Styled like Screen 1 & 2 banner) */}
        {budgetStatus ? (
          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Jatah Jajan Hari Ini
                </span>
                <h3 className="text-2xl font-bold text-text-main tracking-tight mt-0.5">
                  {formatCurrency(budgetStatus.dailyLimit)}
                </h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                budgetStatus.status === 'danger' 
                  ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                  : budgetStatus.status === 'warning'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'bg-[#EBF7F2] text-[#083328] dark:bg-[#14382E] dark:text-[#A3F03A]'
              }`}>
                {budgetStatus.status === 'danger' ? 'Over Limit' : budgetStatus.status === 'warning' ? 'Mendekati' : 'Aman'}
              </span>
            </div>

            <p className="text-[13px] text-text-secondary mb-3">
              Terpakai hari ini: <span className="font-semibold text-text-main">{formatCurrency(budgetStatus.todayExpenses)}</span>
            </p>

            {/* Dual-Tone Lime Progress Bar */}
            <div className="h-2.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-[#A3F03A] rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(budgetStatus.percentageUsed, 100)}%` }}
              />
            </div>

            {/* Card Footer with Carousel Dots */}
            <div className="flex justify-between items-center pt-2 border-t border-border/40 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sisa: <strong className="text-text-main">{formatCurrency(budgetStatus.remainingBudget)}</strong>
              </span>
              <div className="flex items-center gap-1">
                <span className="w-5 h-1.5 rounded-full bg-[#083328] dark:bg-[#A3F03A]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#083328] text-white rounded-3xl p-5 shadow-[0_4px_24px_rgba(8,51,40,0.25)] relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[#A3F03A] text-xs font-bold uppercase tracking-wider">Mulai Budgeting</span>
              <h3 className="text-xl font-bold mt-1 text-white">Atur Batas Belanja Harian</h3>
              <p className="text-white/70 text-xs mt-1 mb-4 leading-relaxed">
                Ketahui berapa uang yang aman dibelanjakan setiap hari sesuai saldo dompet Anda.
              </p>
              <Link
                href="/budget"
                className="inline-flex items-center gap-2 bg-[#A3F03A] text-[#083328] font-bold text-xs px-4 py-2.5 rounded-full shadow-sm active:scale-95 transition-all"
              >
                <span>Buat Budget Sekarang</span>
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        )}

        {/* Cashflow Summary (Pemasukan & Pengeluaran) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-2xl p-4 border border-border/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <ArrowDownLeft size={16} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-medium text-text-secondary">Pemasukan</span>
            </div>
            <p className="font-bold text-sm text-text-main truncate">
              {currentMonthTransactions === undefined ? "..." : displayAmount(monthlyIncome)}
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-4 border border-border/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
                <ArrowUpRight size={16} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-medium text-text-secondary">Pengeluaran</span>
            </div>
            <p className="font-bold text-sm text-text-main truncate">
              {currentMonthTransactions === undefined ? "..." : displayAmount(monthlyExpense)}
            </p>
          </div>
        </div>

        {/* Recent Transactions List (Styled like "Great Deals" in Screen 2) */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-[17px] font-bold text-text-main tracking-tight">Transaksi Terakhir</h2>
            <Link 
              href="/transactions" 
              className="text-xs text-[#083328] dark:text-[#A3F03A] font-bold flex items-center gap-0.5 hover:opacity-80 transition-opacity"
            >
              <span>Lihat Semua</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-surface rounded-3xl border border-border/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] divide-y divide-border/50 overflow-hidden">
            {transactions === undefined ? (
              <div className="text-center text-xs text-text-secondary py-8">Memuat transaksi...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center text-xs text-text-secondary py-8">Belum ada transaksi.</div>
            ) : (
              transactions.map((t) => (
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
                    t.type === 'income' ? 'text-income' : 'text-text-main'
                  }`}>
                    {displayAmount(t.amount, t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '')}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
