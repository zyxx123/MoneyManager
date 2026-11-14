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
  Hexagon
} from "lucide-react";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

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
    if (!showBalance) return `${prefix}Rp •••••••`;
    return `${prefix}${formatCurrency(amount)}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const categoriesGrid = [
    { label: "Wallet", sublabel: "Dompet", icon: Wallet, href: "/wallets", stagger: "stagger-1" },
    { label: "Payments", sublabel: "Transaksi", icon: CreditCard, href: "/transactions", stagger: "stagger-2" },
    { label: "Budget", sublabel: "Budgeting", icon: PieChart, href: "/budget", stagger: "stagger-3" },
    { label: "Reports", sublabel: "Laporan", icon: BarChart3, href: "/reports", stagger: "stagger-4" },
    { label: "Savings", sublabel: "Tabungan", icon: PiggyBank, href: "/savings", stagger: "stagger-5" },
    { label: "Debts", sublabel: "Hutang", icon: HandCoins, href: "/debts", stagger: "stagger-6" },
    { label: "Assets", sublabel: "Aset", icon: Landmark, href: "/assets", stagger: "stagger-7" },
    { label: "Settings", sublabel: "Pengaturan", icon: Settings, href: "/settings", stagger: "stagger-8" },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24 overflow-x-hidden">
      {/* Top Header - Deep Forest Green Gradient with ambient glows */}
      <div className="bg-gradient-to-b from-[#0A3D30] via-[#083328] to-[#06281F] text-white pt-6 pb-12 px-5 relative overflow-hidden transition-colors duration-500">
        {/* Subtle decorative floating glows */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#A3F03A]/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>
        <div className="absolute top-24 -left-12 w-44 h-44 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none animate-float"></div>

        {/* User Greeting & Top Controls */}
        <div className="flex justify-between items-center relative z-10 mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-[#A3F03A]/30 flex items-center justify-center text-[#A3F03A] shadow-inner transition-spring hover:scale-105 hover:rotate-6 active:scale-90 cursor-pointer">
              <Hexagon size={24} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-white/60 text-xs font-normal tracking-wide">{getGreeting()}</p>
              <h1 className="text-white font-bold text-base tracking-tight leading-tight">Pundi Keuangan</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle Theme"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white press-spring tap-pill backdrop-blur-sm"
              >
                {theme === "dark" ? <Sun size={17} className="transition-transform duration-300 rotate-0 hover:rotate-45" /> : <Moon size={17} className="transition-transform duration-300 rotate-0 hover:-rotate-12" />}
              </button>
            )}
            <button
              onClick={toggleShowBalance}
              aria-label="Toggle Balance Visibility"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white press-spring tap-pill backdrop-blur-sm"
            >
              {showBalance ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="relative z-10 mb-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-white/70 text-xs font-medium tracking-wide">Total Balance</p>
            <div className="bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full text-[11px] text-white/90 flex items-center gap-1 font-medium transition-spring hover:scale-105 active:scale-95 backdrop-blur-sm cursor-default select-none">
              <span>IDR</span>
              <span className="text-[9px] opacity-70">▾</span>
            </div>
          </div>
          <div className="text-[34px] font-extrabold text-white tracking-tight leading-none py-1 transition-smooth">
            {wallets === undefined ? "Menghitung..." : displayAmount(totalBalance)}
          </div>
        </div>

        {/* Action Buttons (Request, Transfer, More) */}
        <div className="flex items-center gap-2.5 relative z-10 animate-fade-in-up">
          <Link
            href="/transactions/new?type=income"
            className="flex-1 py-3 px-4 rounded-full bg-white/10 hover:bg-white/18 border border-white/15 text-white font-semibold text-sm flex items-center justify-center gap-2 press-spring tap-pill backdrop-blur-md shadow-sm"
          >
            <ArrowDownLeft size={16} strokeWidth={2.5} className="text-[#A3F03A]" />
            <span>Request</span>
          </Link>

          <Link
            href="/transactions/new?type=expense"
            className="flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] font-bold text-sm flex items-center justify-center gap-2 shadow-lime-glow hover:shadow-lime-glow-lg press-spring tap-pill"
          >
            <ArrowUpRight size={16} strokeWidth={2.5} />
            <span>Transfer</span>
          </Link>

          <Link
            href="/transactions/new?type=transfer"
            aria-label="Transfer Antar Dompet"
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/18 border border-white/15 text-white flex items-center justify-center press-spring tap-pill backdrop-blur-md"
          >
            <MoreVertical size={18} />
          </Link>
        </div>
      </div>

      {/* Main Curved White Sheet with Smooth Transition */}
      <div className="rounded-t-[40px] bg-background pt-7 px-4 pb-14 -mt-6 shadow-2xl relative z-10 space-y-6">
        {/* Categories Card (4x2 Grid with Staggered Cascading Animation) */}
        <div className="bg-surface rounded-[28px] p-5 border border-border/70 shadow-fintech transition-smooth hover:shadow-fintech-lg">
          <h2 className="text-text-main font-bold text-base mb-4 tracking-tight px-1">Categories</h2>
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
            {categoriesGrid.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className={`group flex flex-col items-center cursor-pointer ${item.stagger}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#EBF7F2] dark:bg-[#14382E] text-[#083328] dark:text-[#A3F03A] flex items-center justify-center mb-1.5 shadow-fintech-sm press-spring tap-pill group-hover:scale-108 group-hover:bg-[#DCF3E8] dark:group-hover:bg-[#194639] group-hover:shadow-md">
                  <item.icon size={23} strokeWidth={2.2} className="transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-[12px] font-semibold text-text-main leading-tight transition-colors group-hover:text-[#083328] dark:group-hover:text-[#A3F03A]">
                  {item.label}
                </span>
                <span className="text-[10px] text-text-secondary opacity-75 mt-0.5">
                  {item.sublabel}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Card - Daily Spending Limit */}
        {budgetStatus ? (
          <div className="bg-surface rounded-[28px] p-5 border border-border/70 shadow-fintech card-smooth relative overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Jatah Jajan Hari Ini
                </span>
                <h3 className="text-2xl font-extrabold text-text-main tracking-tight mt-0.5">
                  {formatCurrency(budgetStatus.dailyLimit)}
                </h3>
              </div>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full transition-colors ${
                budgetStatus.status === 'danger' 
                  ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' 
                  : budgetStatus.status === 'warning'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'bg-[#EBF7F2] text-[#083328] dark:bg-[#14382E] dark:text-[#A3F03A]'
              }`}>
                {budgetStatus.status === 'danger' ? 'Over Limit' : budgetStatus.status === 'warning' ? 'Mendekati' : 'Aman'}
              </span>
            </div>

            <div className="flex justify-between items-center text-[13px] mb-3.5">
              <span className="text-text-secondary">
                Terpakai: <span className="font-semibold text-text-main">{formatCurrency(budgetStatus.todayExpenses)}</span>
              </span>
              <span className="text-text-secondary">
                Sisa hari ini: <span className={`font-bold ${budgetStatus.remainingDailyBudget > 0 ? 'text-[#083328] dark:text-[#A3F03A]' : 'text-red-500'}`}>{formatCurrency(budgetStatus.remainingDailyBudget)}</span>
              </span>
            </div>

            {/* Glowing Lime Progress Bar */}
            <div className="h-2.5 w-full bg-surface-muted rounded-full overflow-hidden mb-4 p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] rounded-full shadow-[0_0_12px_rgba(163,240,58,0.45)] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
                style={{ width: `${Math.min(budgetStatus.percentageUsed, 100)}%` }}
              />
            </div>

            {/* Card Footer with Interactive Carousel Indicator Dots */}
            <div className="flex justify-between items-center pt-2.5 border-t border-border/40 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sisa: <strong className="text-text-main font-bold">{formatCurrency(budgetStatus.remainingBudget)}</strong>
              </span>
              <div className="flex items-center gap-1.5 cursor-pointer">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSlide === i 
                        ? "w-6 bg-[#083328] dark:bg-[#A3F03A]" 
                        : "w-1.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#083328] to-[#041D17] text-white rounded-[28px] p-5 shadow-nav relative overflow-hidden animate-fade-in-up">
            <div className="relative z-10">
              <span className="text-[#A3F03A] text-xs font-bold uppercase tracking-wider">Mulai Budgeting</span>
              <h3 className="text-xl font-bold mt-1 text-white">Atur Batas Belanja Harian</h3>
              <p className="text-white/70 text-xs mt-1 mb-4 leading-relaxed">
                Ketahui berapa uang yang aman dibelanjakan setiap hari sesuai saldo dompet Anda.
              </p>
              <Link
                href="/budget"
                className="inline-flex items-center gap-2 bg-[#A3F03A] text-[#083328] font-bold text-xs px-4 py-2.5 rounded-full shadow-lime-glow hover:shadow-lime-glow-lg press-spring tap-pill"
              >
                <span>Buat Budget Sekarang</span>
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        )}

        {/* Cashflow Summary (Pemasukan & Pengeluaran) */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in-up">
          <div className="bg-surface rounded-2xl p-4 border border-border/70 shadow-fintech card-smooth press-spring">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center transition-transform hover:scale-110">
                <ArrowDownLeft size={16} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-medium text-text-secondary">Pemasukan</span>
            </div>
            <p className="font-extrabold text-sm text-text-main truncate">
              {currentMonthTransactions === undefined ? "..." : displayAmount(monthlyIncome)}
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-4 border border-border/70 shadow-fintech card-smooth press-spring">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center transition-transform hover:scale-110">
                <ArrowUpRight size={16} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-medium text-text-secondary">Pengeluaran</span>
            </div>
            <p className="font-extrabold text-sm text-text-main truncate">
              {currentMonthTransactions === undefined ? "..." : displayAmount(monthlyExpense)}
            </p>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="animate-fade-in-up">
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-[17px] font-bold text-text-main tracking-tight">Transaksi Terakhir</h2>
            <Link 
              href="/transactions" 
              className="text-xs text-[#083328] dark:text-[#A3F03A] font-bold flex items-center gap-0.5 hover:opacity-80 transition-spring active:scale-95"
            >
              <span>Lihat Semua</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="bg-surface rounded-[28px] border border-border/70 shadow-fintech divide-y divide-border/40 overflow-hidden">
            {transactions === undefined ? (
              <div className="text-center text-xs text-text-secondary py-8">Memuat transaksi...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center text-xs text-text-secondary py-8">Belum ada transaksi.</div>
            ) : (
              transactions.map((t) => (
                <Link
                  href={`/transactions/${t.id}/edit`}
                  key={t.id}
                  className="p-4 flex items-center justify-between hover:bg-[#EBF7F2]/40 dark:hover:bg-white/[0.03] active:scale-[0.99] transition-smooth block group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-108 ${
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
                      <p className="font-semibold text-sm text-text-main capitalize leading-snug group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">
                        {t.type === 'transfer' ? 'Transfer Antar Dompet' : t.note || 'Transaksi'}
                      </p>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        {format(t.date, "d MMM yyyy", { locale: localeID })}
                      </p>
                    </div>
                  </div>

                  <div className={`font-bold text-sm text-right transition-transform group-hover:scale-105 ${
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
