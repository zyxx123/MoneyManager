"use client";

import { useState } from "react";
import { budgetService } from "@/lib/services/budgetService";
import { walletService } from "@/lib/services/walletService";
import { AlertCircle, Trash2, Edit2, CalendarIcon, ArrowLeft } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";

export default function BudgetPage() {
  // Modes: "view" | "create" | "edit"
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const wallets = useLiveQuery(() => walletService.getAllActive());
  const budgetStatus = useLiveQuery(() => budgetService.getDailyLimitStatus());

  const loading = wallets === undefined || budgetStatus === undefined;

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  const allWalletsBalance = wallets
    ? wallets.filter(w => w.type !== 'savings').reduce((sum, w) => sum + w.cachedBalance, 0)
    : 0;

  const currentSelectedBalance = wallets
    ? (selectedWalletIds.length === 0
        ? allWalletsBalance
        : wallets.filter(w => selectedWalletIds.includes(w.id)).reduce((sum, w) => sum + w.cachedBalance, 0))
    : 0;

  const handleCreateOrEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalWalletIds = selectedWalletIds.length > 0 ? selectedWalletIds : undefined;
    const start = dateRange?.from || startOfMonth(new Date());
    const end = dateRange?.to || endOfMonth(new Date());
    const amount = Math.max(0, currentSelectedBalance);

    if (start <= end) {
      if (mode === "create") {
        await budgetService.createBudget(amount, start, end, finalWalletIds);
      } else if (mode === "edit" && budgetStatus?.id) {
        await budgetService.updateBudget(budgetStatus.id, {
          amount,
          walletIds: finalWalletIds,
          periodStart: start,
          periodEnd: end,
        });
      }
      setMode("view");
    } else if (start > end) {
      alert("Tanggal mulai tidak boleh lebih dari tanggal selesai");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus budget aktif ini?")) return;
    if (budgetStatus?.id) {
      await budgetService.deleteBudget(budgetStatus.id);
      setMode("view");
    }
  };

  const openEditMode = () => {
    if (budgetStatus) {
      setSelectedWalletIds(budgetStatus.walletIds || []);
      setDateRange({
        from: budgetStatus.periodStart || startOfMonth(new Date()),
        to: budgetStatus.periodEnd || endOfMonth(new Date())
      });
      setMode("edit");
    }
  };

  const openCreateMode = () => {
    setSelectedWalletIds([]);
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    });
    setMode("create");
  };

  if (loading) {
    return null;
  }

  if (mode === "create" || mode === "edit") {
    return (
      <div className="p-5 max-w-md mx-auto min-h-screen bg-background flex flex-col pb-28 relative animate-fade-in-up">
        <div className="flex items-center mb-6 mt-2">
          <button
            type="button"
            onClick={() => setMode("view")}
            aria-label="Kembali"
            className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main transition-colors mr-3 press-spring tap-pill"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-[22px] font-bold text-text-main tracking-tight">
            {mode === "create" ? "Tentukan Budget" : "Edit Budget"}
          </h2>
        </div>
        
        <form onSubmit={handleCreateOrEditBudget} className="space-y-6">
          {/* Berlaku Untuk Dompet */}
          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-fintech space-y-3 card-smooth">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                Berlaku Untuk Dompet
              </label>
              <span className="text-[11px] font-medium text-text-secondary bg-surface-muted px-2.5 py-0.5 rounded-full">
                Pilih satu atau lebih
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedWalletIds([])}
                className={`px-4 py-2.5 rounded-2xl font-medium transition-spring press-spring tap-pill flex flex-col items-start ${
                  selectedWalletIds.length === 0 
                  ? "bg-[#083328] text-white shadow-md font-bold scale-[1.02]" 
                  : "bg-surface-muted text-text-secondary hover:bg-black/5"
                }`}
              >
                <span className="text-[13px]">Semua Dompet</span>
                <span className={`text-[11px] font-medium ${selectedWalletIds.length === 0 ? "text-[#A3F03A]" : "opacity-70"}`}>
                  {formatter.format(allWalletsBalance)}
                </span>
              </button>
              {wallets?.map(w => {
                const isSelected = selectedWalletIds.includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedWalletIds(prev => prev.filter(id => id !== w.id));
                      } else {
                        setSelectedWalletIds(prev => [...prev, w.id]);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-2xl font-medium transition-spring press-spring tap-pill flex flex-col items-start ${
                      isSelected 
                      ? "bg-[#083328] text-white shadow-md font-bold scale-[1.02]" 
                      : "bg-surface-muted text-text-secondary hover:bg-black/5"
                    }`}
                  >
                    <span className="text-[13px]">{w.name}</span>
                    <span className={`text-[11px] font-medium ${isSelected ? "text-[#A3F03A]" : "opacity-70"}`}>
                      {formatter.format(w.cachedBalance)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saldo Budget Realtime */}
          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-fintech space-y-3 card-smooth">
            <div className="flex justify-between items-center">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                Total Budget (Saldo Realtime)
              </label>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-[#A3F03A] flex items-center gap-1.5 bg-[#EBF7F2] dark:bg-[#14382E] px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Otomatis Realtime
              </span>
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">Rp</span>
              <input
                type="text"
                readOnly
                value={new Intl.NumberFormat("id-ID").format(Math.max(0, currentSelectedBalance))}
                className="w-full p-4 pl-12 bg-surface-muted border border-border/80 rounded-2xl outline-none text-2xl font-bold text-text-main cursor-default select-none transition-smooth"
              />
            </div>
            <p className="text-[12px] text-text-secondary">
              Saldo budget akan selalu sinkron dengan saldo realtime dompet yang Anda pilih secara otomatis.
            </p>
          </div>

          {/* Periode Budget */}
          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-fintech space-y-2 relative card-smooth">
            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Periode Budget
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(true)}
                className="w-full p-4 bg-surface-muted border border-border/80 rounded-2xl outline-none text-left flex justify-between items-center text-[14px] font-semibold text-text-main press-spring tap-pill"
              >
                <span>
                  {dateRange?.from ? format(dateRange.from, "d MMM", { locale: localeID }) : "Pilih Tanggal"} -{" "}
                  {dateRange?.to ? format(dateRange.to, "d MMM yyyy", { locale: localeID }) : "..."}
                </span>
                <CalendarIcon size={18} className="text-text-secondary" />
              </button>

              {/* Smooth Dialog Modal for DatePicker */}
              {showDatePicker && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
                  onClick={() => setShowDatePicker(false)}
                >
                  <div 
                    className="bg-surface border border-border/80 rounded-[32px] shadow-2xl p-5 w-full max-w-sm flex flex-col items-center animate-scale-up"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-10 h-1 bg-border/80 rounded-full mb-3"></div>
                    <h3 className="text-sm font-bold text-text-main mb-2">Pilih Periode Budget</h3>
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                    />
                    <div className="mt-4 flex justify-end w-full border-t border-border/60 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="bg-[#083328] text-[#A3F03A] px-6 py-2.5 rounded-full font-bold text-xs press-spring tap-pill shadow-sm"
                      >
                        Terapkan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setMode("view")}
              className="flex-1 py-3.5 bg-surface-muted text-text-main rounded-full font-bold hover:bg-black/5 press-spring tap-pill"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[2] py-3.5 bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] rounded-full font-bold text-sm shadow-lime-glow hover:shadow-lime-glow-lg press-spring tap-pill"
            >
              Simpan Budget
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (!budgetStatus) {
    return (
      <div className="p-6 max-w-md mx-auto min-h-screen bg-background flex flex-col items-center justify-center space-y-4 animate-fade-in-up">
        <div className="w-20 h-20 bg-[#EBF7F2] dark:bg-[#14382E] rounded-3xl flex items-center justify-center text-[#083328] dark:text-[#A3F03A] shadow-sm animate-bounce-subtle">
          <AlertCircle size={40} strokeWidth={2} />
        </div>
        <h2 className="text-[22px] font-bold text-text-main tracking-tight">Belum Ada Budget</h2>
        <p className="text-center text-text-secondary text-[14px] px-4 leading-relaxed">
          Buat budget untuk mulai mengatur batas pengeluaran harian yang aman sesuai saldo realtime dompet Anda.
        </p>
        <button
          onClick={openCreateMode}
          className="bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] px-8 py-3.5 rounded-full font-bold text-sm mt-4 shadow-lime-glow hover:shadow-lime-glow-lg press-spring tap-pill"
        >
          Buat Budget Baru
        </button>
      </div>
    );
  }

  const { 
    budgetAmount, 
    dailyLimit, 
    todayExpenses, 
    totalExpenses, 
    percentageUsed, 
    status, 
    walletIds, 
    periodStart, 
    periodEnd,
    remainingBudget
  } = budgetStatus;
  
  const linkedWalletName = walletIds && walletIds.length > 0
    ? wallets?.filter(w => walletIds.includes(w.id)).map(w => w.name).join(", ") || "Dompet Terhapus"
    : "Semua Dompet";

  const percentageBudgetUsed = budgetAmount > 0 
    ? (totalExpenses / budgetAmount) * 100 
    : (totalExpenses > 0 ? 100 : 0);

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pt-6 pb-28 bg-background min-h-screen animate-fade-in-up">
      <div className="flex justify-between items-center mb-1 px-1">
        <h1 className="text-[22px] font-bold text-text-main tracking-tight">Budgeting</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={openEditMode} 
            aria-label="Edit Budget"
            className="w-9 h-9 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main press-spring tap-pill"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={handleDelete} 
            aria-label="Delete Budget"
            className="w-9 h-9 rounded-full bg-surface border border-border/80 flex items-center justify-center text-expense hover:bg-red-50 dark:hover:bg-red-950/20 press-spring tap-pill"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Daily Limit Card (Deep Forest Green with Lime Accent) */}
      <div className="bg-[#083328] rounded-3xl p-6 text-white shadow-[0_8px_30px_rgba(8,51,40,0.3)] relative overflow-hidden card-smooth">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#A3F03A]/15 rounded-full blur-2xl pointer-events-none animate-pulse-subtle"></div>
        
        <div className="flex justify-between items-start relative z-10 mb-4">
          <div>
            <h2 className="text-white/70 font-medium text-[12px] uppercase tracking-wider">Jatah Jajan Hari Ini</h2>
            <div className="text-3xl font-bold tracking-tight text-white mt-1 transition-smooth">
              {formatter.format(dailyLimit)}
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
            status === 'danger'
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : status === 'warning'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-white/10 text-[#A3F03A] border border-white/10'
          }`}>
            {status === 'upcoming' ? 'Akan Datang' : status === 'warning' ? 'Mendekati Limit' : status === 'danger' ? 'Melebihi Limit!' : 'Pengeluaran Aman'}
          </div>
        </div>
        
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md relative z-10 border border-white/10">
          <div className="flex justify-between text-[13px] mb-2.5">
            <span className="text-white/80">Terpakai Hari Ini</span>
            <span className="font-bold tracking-wide text-white">{formatter.format(todayExpenses)}</span>
          </div>
          
          {/* Dual-Tone Lime Progress Bar */}
          <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] rounded-full shadow-[0_0_10px_rgba(163,240,58,0.5)] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <div className="text-[11px] font-medium text-white/70 mt-2 text-right">
            {percentageUsed.toFixed(0)}% dari limit harian
          </div>
        </div>
      </div>

      {/* Ringkasan Budget Card */}
      <div className="bg-surface border border-border/80 rounded-3xl p-5 shadow-fintech space-y-4 card-smooth">
        <h3 className="font-bold text-text-main text-[16px] tracking-tight">Ringkasan Budget</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-[13px] text-text-secondary">
            <span>Periode</span>
            <span className="font-semibold text-text-main">
              {periodStart ? format(periodStart, "d MMM", { locale: localeID }) : "-"} s/d {periodEnd ? format(periodEnd, "d MMM yyyy", { locale: localeID }) : "-"}
            </span>
          </div>
          
          <div className="flex justify-between text-[13px] text-text-secondary items-center">
            <span>Berlaku Untuk</span>
            <span className="font-bold text-[#083328] dark:text-[#A3F03A] bg-[#EBF7F2] dark:bg-[#14382E] px-3 py-1 rounded-full text-[11px]">
              {linkedWalletName}
            </span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-border/50 space-y-2">
          <div className="flex justify-between text-[13px] text-text-secondary">
            <span>Total Alokasi Budget</span>
            <span className="font-semibold text-text-main">{formatter.format(budgetAmount)}</span>
          </div>
          <div className="flex justify-between text-[13px] text-text-secondary">
            <span>Total Terpakai</span>
            <span className="font-semibold text-expense">-{formatter.format(totalExpenses)}</span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-border/50">
          <div className="flex justify-between items-center text-[13px] mb-2">
            <span className="text-text-secondary flex items-center gap-1.5 font-medium">
              Sisa Budget (Saldo Dompet)
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Realtime Dompet"></span>
            </span>
            <span className="font-bold text-text-main text-[16px]">{formatter.format(remainingBudget)}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] rounded-full shadow-[0_0_8px_rgba(163,240,58,0.4)] transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)"
              style={{ width: `${Math.min(percentageBudgetUsed, 100)}%` }}
            />
          </div>
          <div className="text-[11px] font-medium text-text-secondary mt-1.5 text-right">
            {percentageBudgetUsed.toFixed(0)}% terpakai
          </div>
        </div>
      </div>
    </div>
  );
}
