"use client";

import { useState, useEffect } from "react";
import { budgetService } from "@/lib/services/budgetService";
import { walletService } from "@/lib/services/walletService";
import { AlertCircle, CheckCircle2, AlertTriangle, Trash2, Edit2, CalendarIcon } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";

export default function BudgetPage() {
  const [budgetStatus, setBudgetStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modes: "view" | "create" | "edit"
  const [mode, setMode] = useState<"view" | "create" | "edit">("view");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const wallets = useLiveQuery(() => walletService.getAllActive());

  const loadBudget = async () => {
    setLoading(true);
    const status = await budgetService.getDailyLimitStatus();
    setBudgetStatus(status);
    
    if (status) {
      setMode("view");
    } else {
      setMode("view");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBudget();
  }, []);

  const handleCreateOrEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newBudgetAmount.replace(/\D/g, ""));
    const finalWalletIds = selectedWalletIds.length > 0 ? selectedWalletIds : undefined;
    const start = dateRange?.from || startOfMonth(new Date());
    const end = dateRange?.to || endOfMonth(new Date());

    if (amount > 0 && start <= end) {
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
      loadBudget();
    } else if (start > end) {
      alert("Tanggal mulai tidak boleh lebih dari tanggal selesai");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setNewBudgetAmount("");
      return;
    }
    setNewBudgetAmount(new Intl.NumberFormat("id-ID").format(Number(raw)));
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus budget aktif ini?")) return;
    if (budgetStatus?.id) {
      await budgetService.deleteBudget(budgetStatus.id);
      loadBudget();
    }
  };

  const openEditMode = () => {
    if (budgetStatus) {
      setNewBudgetAmount(new Intl.NumberFormat("id-ID").format(budgetStatus.budgetAmount));
      setSelectedWalletIds(budgetStatus.walletIds || []);
      setDateRange({
        from: budgetStatus.periodStart || startOfMonth(new Date()),
        to: budgetStatus.periodEnd || endOfMonth(new Date())
      });
      setMode("edit");
    }
  };

  const openCreateMode = () => {
    setNewBudgetAmount("");
    setSelectedWalletIds([]);
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    });
    setMode("create");
  };

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  if (loading) {
    return null;
  }

  if (!budgetStatus && mode === "view") {
    return (
      <div className="p-4 max-w-md mx-auto min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-24 h-24 bg-primary-soft rounded-2xl flex items-center justify-center text-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black">
          <AlertCircle size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-[22px] font-bold text-text-main">Belum Ada Budget</h2>
        <p className="text-center text-text-secondary text-[15px] px-4 leading-relaxed">
          Buat budget untuk mulai mengatur batas pengeluaran harian yang aman.
        </p>
        <button
          onClick={openCreateMode}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold mt-6 hover:opacity-90 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black"
        >
          Buat Budget Baru
        </button>
      </div>
    );
  }

  if (mode === "create" || mode === "edit") {
    return (
      <div className="p-5 max-w-md mx-auto min-h-screen bg-background flex flex-col pb-24 relative">
        <h2 className="text-[24px] font-bold text-text-main mb-8 mt-4">{mode === "create" ? "Tentukan Budget" : "Edit Budget"}</h2>
        <form onSubmit={handleCreateOrEditBudget} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-text-secondary uppercase tracking-wider ml-1">
              Total Budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={newBudgetAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full p-5 pl-14 bg-surface border-[3px] border-black rounded-2xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all duration-200 text-3xl font-bold text-text-main shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-bold text-text-secondary uppercase tracking-wider ml-1">
              Berlaku Untuk Dompet
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedWalletIds([])}
                className={`px-4 py-2 rounded-xl font-medium border-[3px] transition-all ${
                  selectedWalletIds.length === 0 
                  ? "bg-primary border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black font-bold" 
                  : "bg-surface border-black/20 text-text-secondary hover:border-black/50"
                }`}
              >
                Semua Dompet
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
                    className={`px-4 py-2 rounded-xl font-medium border-[3px] transition-all ${
                      isSelected 
                      ? "bg-primary border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black font-bold" 
                      : "bg-surface border-black/20 text-text-secondary hover:border-black/50"
                    }`}
                  >
                    {w.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-[13px] font-bold text-text-secondary uppercase tracking-wider ml-1">
              Periode Budget
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full p-4 bg-surface border-[3px] border-black rounded-2xl focus:ring-1 focus:ring-primary outline-none text-left flex justify-between items-center text-[15px] font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-transform"
              >
                <span>
                  {dateRange?.from ? format(dateRange.from, "d MMM", { locale: localeID }) : "Pilih Tanggal"} -{" "}
                  {dateRange?.to ? format(dateRange.to, "d MMM yyyy", { locale: localeID }) : "..."}
                </span>
                <CalendarIcon size={20} className="text-text-secondary" />
              </button>

              {showDatePicker && (
                <div className="absolute z-[100] mt-2 bg-surface border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 right-0 left-0 flex flex-col items-center">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                  />
                  <div className="mt-4 flex justify-end w-full border-t-[3px] border-black pt-3">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="bg-primary text-white px-5 py-2.5 rounded-[12px] font-bold text-[14px] hover:opacity-90 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => {
                if (budgetStatus) setMode("view");
                else loadBudget();
              }}
              className="flex-1 py-4 bg-border-subtle/50 text-text-main rounded-2xl font-bold hover:bg-border-subtle active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold hover:opacity-90 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black"
            >
              Simpan Budget
            </button>
          </div>
        </form>
      </div>
    );
  }

  const { budgetAmount, dailyLimit, todayExpenses, percentageUsed, status, walletIds, periodStart, periodEnd } = budgetStatus;
  
  const linkedWalletName = walletIds && walletIds.length > 0
    ? wallets?.filter(w => walletIds.includes(w.id)).map(w => w.name).join(", ") || "Dompet Terhapus"
    : "Semua Dompet";

  // Determine colors based on status (Solid colors, no harsh gradients)
  let statusColor = "bg-income";
  let StatusIcon = CheckCircle2;
  let statusText = "Pengeluaran Aman";

  if (status === 'upcoming') {
    statusColor = "bg-primary text-black";
    StatusIcon = CalendarIcon;
    statusText = "Akan Datang";
  } else if (status === 'warning') {
    statusColor = "bg-warning";
    StatusIcon = AlertTriangle;
    statusText = "Mendekati Limit";
  } else if (status === 'danger') {
    statusColor = "bg-expense";
    StatusIcon = AlertCircle;
    statusText = "Melebihi Limit!";
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pt-6 pb-24 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-2 px-1">
        <h1 className="text-[24px] font-bold text-text-main">Budgeting</h1>
        <div className="flex gap-1">
          <button onClick={openEditMode} className="p-2.5 text-text-secondary hover:bg-surface rounded-2xl transition-colors active:translate-y-1 active:translate-x-1 active:shadow-none">
            <Edit2 size={20} />
          </button>
          <button onClick={handleDelete} className="p-2.5 text-expense hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors active:translate-y-1 active:translate-x-1 active:shadow-none">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      {/* Daily Limit Card */}
      <div className={`${statusColor} rounded-2xl p-6 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black relative overflow-hidden transition-colors duration-500`}>
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-2xl blur-2xl"></div>
        
        <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-2xl text-[12px] font-bold backdrop-blur-md">
          <StatusIcon size={14} strokeWidth={2.5} />
          {statusText}
        </div>
        
        <h2 className="text-white/80 font-medium mb-1 text-[13px] uppercase tracking-wider relative z-10 mt-2">Jatah Jajan Hari Ini</h2>
        <div className="text-4xl font-bold tracking-tight mb-8 relative z-10">
          {formatter.format(dailyLimit)}
        </div>
        
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md relative z-10 border border-white/10">
          <div className="flex justify-between text-[14px] mb-3">
            <span className="text-white/90">Terpakai Hari Ini</span>
            <span className="font-bold tracking-wide">{formatter.format(todayExpenses)}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2.5 w-full bg-black/20 rounded-2xl overflow-hidden">
            <div 
              className="h-full bg-white rounded-2xl transition-all duration-200 duration-700 ease-out"
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <div className="text-[12px] font-medium text-white/80 mt-2 text-right">
            {percentageUsed.toFixed(0)}% dari limit
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="bg-surface border-[3px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-bold text-text-main text-[16px] mb-5 px-1">Ringkasan Budget</h3>
        
        <div className="space-y-4 px-1">
          <div>
            <div className="flex justify-between text-[14px] text-text-secondary mb-2">
              <span>Periode</span>
              <span className="font-medium text-text-main">
                {periodStart ? format(periodStart, "d MMM", { locale: localeID }) : "-"} s/d {periodEnd ? format(periodEnd, "d MMM yyyy", { locale: localeID }) : "-"}
              </span>
            </div>
            <div className="flex justify-between text-[14px] text-text-secondary mb-1">
              <span>Berlaku Untuk</span>
              <span className="font-bold text-primary bg-primary-soft px-2.5 py-0.5 rounded-[6px] text-[12px]">{linkedWalletName}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t-[3px] border-black">
            <div className="flex justify-between text-[14px] text-text-secondary mb-1">
              <span>Total Budget</span>
              <span className="font-medium text-text-main">{formatter.format(budgetAmount)}</span>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between text-[14px] text-text-secondary mb-2">
              <span>Sisa Budget</span>
              <span className="font-medium text-text-main">{formatter.format(budgetStatus.remainingBudget)}</span>
            </div>
            {/* Progress */}
            <div className="h-2 w-full bg-border-subtle/50 rounded-2xl overflow-hidden">
              <div 
                className="h-full bg-primary rounded-2xl transition-all duration-200 duration-700 ease-out"
                style={{ width: `${Math.min((budgetStatus.totalExpenses / budgetAmount) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
