"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { walletService } from "@/lib/services/walletService";
import { transactionService } from "@/lib/services/transactionService";
import { budgetService } from "@/lib/services/budgetService";
import { currencyService, SUPPORTED_CURRENCIES } from "@/lib/services/currencyService";
import CashflowChart from "@/components/CashflowChart";
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

  // Currency Selection & Realtime Rates
  const [selectedCurrency, setSelectedCurrency] = useState("IDR");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    const savedBalance = localStorage.getItem("showBalance");
    if (savedBalance !== null) {
      setShowBalance(savedBalance === "true");
    }

    const savedCurrency = localStorage.getItem("preferredCurrency");
    if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
      setSelectedCurrency(savedCurrency);
    }

    // Fetch exchange rates from API / cache
    currencyService.getRates().then((rates) => {
      setExchangeRates(rates);
    });
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

  const formatCurrency = (amountInIDR: number, prefix: string = '') => {
    return currencyService.format(amountInIDR, selectedCurrency, exchangeRates, prefix);
  };

  const toggleShowBalance = () => {
    const next = !showBalance;
    setShowBalance(next);
    localStorage.setItem("showBalance", String(next));
  };

  const displayAmount = (amount: number, prefix: string = '') => {
    const curr = SUPPORTED_CURRENCIES[selectedCurrency] || SUPPORTED_CURRENCIES.IDR;
    if (!showBalance) return `${prefix}${curr.symbol} •••••••`;
    return formatCurrency(amount, prefix);
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
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 overflow-x-hidden">
      {/* Top Header - Deep Forest Green Liquid Glass Gradient with Ambient Glows */}
      <div className="bg-gradient-to-b from-[#0A3D30] via-[#083328] to-[#06281F] text-white pt-6 pb-12 px-5 relative overflow-hidden transition-colors duration-500">
        {/* Subtle decorative floating liquid glows */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#A3F03A]/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>
        <div className="absolute top-24 -left-12 w-44 h-44 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none animate-float"></div>

        {/* User Greeting & Top Controls */}
        <div className="flex justify-between items-center relative z-10 mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] liquid-glass-pill flex items-center justify-center text-[#A3F03A] shadow-inner transition-spring hover:scale-105 hover:rotate-6 active:scale-90 cursor-pointer">
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
                className="w-9 h-9 rounded-full liquid-glass-pill flex items-center justify-center text-white press-spring tap-pill"
              >
                {theme === "dark" ? <Sun size={17} className="transition-transform duration-300 rotate-0 hover:rotate-45" /> : <Moon size={17} className="transition-transform duration-300 rotate-0 hover:-rotate-12" />}
              </button>
            )}
            <button
              onClick={toggleShowBalance}
              aria-label="Toggle Balance Visibility"
              className="w-9 h-9 rounded-full liquid-glass-pill flex items-center justify-center text-white press-spring tap-pill"
            >
              {showBalance ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </div>
        </div>

        {/* Total Balance Card with Liquid Glass Currency Selector */}
        <div className="relative z-10 mb-6 animate-fade-in-up">
          <div className="flex justify-between items-center mb-1.5">
            <p className="text-white/70 text-xs font-medium tracking-wide">Total Balance</p>
            
            {/* Currency Selector Pill (Liquid Glass) */}
            <button
              onClick={() => setShowCurrencyModal(true)}
              aria-label="Pilih Kurs Mata Uang"
              className="liquid-glass-pill px-3.5 py-1 rounded-full text-[11px] text-white flex items-center gap-1.5 font-bold transition-spring hover:scale-105 active:scale-95 cursor-pointer select-none"
            >
              <span className="text-xs">{SUPPORTED_CURRENCIES[selectedCurrency]?.flag || "🇮🇩"}</span>
              <span>{selectedCurrency}</span>
              <span className="text-[9px] opacity-70">▾</span>
            </button>
          </div>
          <div className="text-[34px] font-extrabold text-white tracking-tight leading-none py-1 transition-smooth">
            {wallets === undefined ? "Menghitung..." : displayAmount(totalBalance)}
          </div>
        </div>

        {/* Action Buttons: Pemasukan & Pengeluaran (Liquid Bubble Pills) */}
        <div className="flex items-center gap-3 relative z-10 animate-fade-in-up">
          <Link
            href="/transactions/new?type=income"
            className="flex-1 py-3.5 px-4 rounded-full liquid-glass-pill hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 press-spring tap-pill"
          >
            <ArrowDownLeft size={18} strokeWidth={2.6} className="text-[#A3F03A]" />
            <span>Pemasukan</span>
          </Link>

          <Link
            href="/transactions/new?type=expense"
            className="flex-1 py-3.5 px-4 rounded-full bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lime-glow hover:shadow-lime-glow-lg press-spring tap-pill"
          >
            <ArrowUpRight size={18} strokeWidth={2.6} />
            <span>Pengeluaran</span>
          </Link>
        </div>
      </div>

      {/* Main Curved Bubble Sheet with Smooth Elevation */}
      <div className="rounded-t-[44px] bg-background pt-7 px-4 pb-14 -mt-6 relative z-10 space-y-5">
        {/* Categories Card (Bubble & Liquid Pill) */}
        <div className="bubble-card p-5 animate-fade-in-up">
          <h2 className="text-text-main font-bold text-base mb-4 tracking-tight px-1">Categories</h2>
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
            {categoriesGrid.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className={`group flex flex-col items-center cursor-pointer ${item.stagger}`}
              >
                <div className="w-14 h-14 rounded-[22px] bg-[#EBF7F2] dark:bg-[#14382E] text-[#083328] dark:text-[#A3F03A] flex items-center justify-center mb-1.5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(8,51,40,0.04)] press-spring tap-pill group-hover:scale-108 group-hover:bg-[#DCF3E8] dark:group-hover:bg-[#194639]">
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

        {/* Featured Card - Daily Spending Limit (Bubble Card) */}
        {budgetStatus ? (
          <div className="bubble-card p-6 relative overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-start mb-2.5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Jatah Jajan Hari Ini
                </span>
                <h3 className="text-2xl font-extrabold text-text-main tracking-tight mt-0.5">
                  {formatCurrency(budgetStatus.dailyLimit)}
                </h3>
              </div>
              <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full transition-colors shadow-sm ${
                budgetStatus.status === 'danger' 
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400' 
                  : budgetStatus.status === 'warning'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
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
                className="h-full bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] rounded-full shadow-[0_0_12px_rgba(163,240,58,0.55)] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
                style={{ width: `${Math.min(budgetStatus.percentageUsed, 100)}%` }}
              />
            </div>

            {/* Card Footer with Carousel Indicator Dots */}
            <div className="flex justify-between items-center pt-2.5 border-t border-black/5 dark:border-white/5 text-xs text-text-secondary">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sisa Dompet: <strong className="text-text-main font-bold">{formatCurrency(budgetStatus.remainingBudget)}</strong>
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
          <div className="bg-gradient-to-br from-[#083328] to-[#041D17] text-white rounded-[32px] p-6 shadow-nav relative overflow-hidden animate-fade-in-up">
            <div className="relative z-10">
              <span className="text-[#A3F03A] text-xs font-bold uppercase tracking-wider">Mulai Budgeting</span>
              <h3 className="text-xl font-bold mt-1 text-white">Atur Batas Belanja Harian</h3>
              <p className="text-white/70 text-xs mt-1 mb-4 leading-relaxed">
                Ketahui berapa uang yang aman dibelanjakan setiap hari sesuai saldo dompet Anda.
              </p>
              <Link
                href="/budget"
                className="inline-flex items-center gap-2 bg-[#A3F03A] text-[#083328] font-bold text-xs px-5 py-3 rounded-full shadow-lime-glow hover:shadow-lime-glow-lg press-spring tap-pill"
              >
                <span>Buat Budget Sekarang</span>
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        )}

        {/* 7-Day Spending Trend Chart (Bubble Card) */}
        <CashflowChart formatValue={formatCurrency} />

        {/* Cashflow Summary (Pemasukan & Pengeluaran Bubble Cards) */}
        <div className="grid grid-cols-2 gap-3.5 animate-fade-in-up">
          <div className="bubble-card p-4.5 rounded-[26px] press-spring">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform hover:scale-110 shadow-sm">
                <ArrowDownLeft size={16} strokeWidth={2.6} />
              </div>
              <span className="text-xs font-semibold text-text-secondary">Pemasukan</span>
            </div>
            <p className="font-extrabold text-sm text-text-main truncate">
              {currentMonthTransactions === undefined ? "..." : displayAmount(monthlyIncome)}
            </p>
          </div>

          <div className="bubble-card p-4.5 rounded-[26px] press-spring">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/15 text-red-500 dark:text-red-400 flex items-center justify-center transition-transform hover:scale-110 shadow-sm">
                <ArrowUpRight size={16} strokeWidth={2.6} />
              </div>
              <span className="text-xs font-semibold text-text-secondary">Pengeluaran</span>
            </div>
            <p className="font-extrabold text-sm text-text-main truncate">
              {currentMonthTransactions === undefined ? "..." : displayAmount(monthlyExpense)}
            </p>
          </div>
        </div>

        {/* Recent Transactions List (Floating Bubble Items, No Rigid Dividing Lines) */}
        <div className="animate-fade-in-up space-y-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[17px] font-bold text-text-main tracking-tight">Transaksi Terakhir</h2>
            <Link 
              href="/transactions" 
              className="text-xs text-[#083328] dark:text-[#A3F03A] font-bold flex items-center gap-0.5 hover:opacity-80 transition-spring active:scale-95"
            >
              <span>Lihat Semua</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {transactions === undefined ? (
              <div className="bubble-card text-center text-xs text-text-secondary py-8 font-medium">Memuat transaksi...</div>
            ) : transactions.length === 0 ? (
              <div className="bubble-card text-center text-xs text-text-secondary py-8 font-medium">Belum ada transaksi.</div>
            ) : (
              transactions.map((t, idx) => (
                <Link
                  href={`/transactions/${t.id}/edit`}
                  key={t.id}
                  className={`bubble-item p-4 flex items-center justify-between block group stagger-${Math.min(idx + 1, 8)}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-[18px] flex items-center justify-center transition-transform duration-300 group-hover:scale-108 shadow-sm ${
                      t.type === 'income' 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                        : t.type === 'expense'
                        ? 'bg-red-500/15 text-red-500 dark:text-red-400'
                        : 'bg-blue-500/15 text-blue-500 dark:text-blue-400'
                    }`}>
                      {t.type === 'income' ? (
                        <ArrowDownLeft size={19} strokeWidth={2.6} />
                      ) : (
                        <ArrowUpRight size={19} strokeWidth={2.6} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-text-main capitalize leading-snug group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">
                        {t.type === 'transfer' ? 'Transfer Antar Dompet' : t.note || 'Transaksi'}
                      </p>
                      <p className="text-[11px] text-text-secondary mt-0.5 font-medium">
                        {format(t.date, "d MMM yyyy", { locale: localeID })}
                      </p>
                    </div>
                  </div>

                  <div className={`font-extrabold text-sm text-right transition-transform group-hover:scale-105 ${
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

      {/* Currency Selection Dialog Modal (Liquid Bubble Modal) */}
      {showCurrencyModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setShowCurrencyModal(false)}
        >
          <div 
            className="bubble-card p-6 w-full max-w-sm flex flex-col max-h-[85vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border/80 rounded-full mx-auto mb-3"></div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-base font-bold text-text-main">Pilih Mata Uang</h3>
              <span className="text-[11px] text-emerald-600 dark:text-[#A3F03A] font-extrabold bg-[#EBF7F2] dark:bg-[#14382E] px-2.5 py-0.5 rounded-full shadow-sm">
                Realtime Kurs
              </span>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              Nilai saldo akan dikonversikan otomatis secara realtime sesuai kurs yang dipilih.
            </p>

            <div className="overflow-y-auto space-y-2 pr-0.5">
              {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => {
                const isSelected = selectedCurrency === code;
                const currentRate = exchangeRates[code] || info.defaultRate;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setSelectedCurrency(code);
                      localStorage.setItem("preferredCurrency", code);
                      setShowCurrencyModal(false);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-[20px] transition-spring press-spring tap-pill text-left ${
                      isSelected 
                        ? "bg-[#083328] text-white shadow-md font-bold scale-[1.01]" 
                        : "bubble-item text-text-main"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-sm">{code}</span>
                          <span className={`text-xs ${isSelected ? "text-white/80" : "text-text-secondary"}`}>({info.symbol})</span>
                        </div>
                        <span className={`text-[11px] block ${isSelected ? "text-white/70" : "text-text-secondary"}`}>{info.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {code === "IDR" ? (
                        <span className={`text-[11px] font-semibold ${isSelected ? "text-[#A3F03A]" : "text-text-secondary"}`}>Utama</span>
                      ) : (
                        <span className={`text-[11px] font-mono font-medium ${isSelected ? "text-[#A3F03A]" : "text-text-secondary"}`}>
                          1 {code} ≈ Rp {new Intl.NumberFormat("id-ID").format(Math.round(1 / currentRate))}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCurrencyModal(false)}
                className="bg-surface-muted hover:bg-black/5 dark:hover:bg-white/5 text-text-main px-6 py-2.5 rounded-full font-bold text-xs press-spring tap-pill"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
