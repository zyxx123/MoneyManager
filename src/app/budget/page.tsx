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
  const [selectedWalletId, setSelectedWalletId] = useState("");
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
    const finalWalletId = selectedWalletId === "all" ? undefined : selectedWalletId;
    const start = dateRange?.from || startOfMonth(new Date());
    const end = dateRange?.to || endOfMonth(new Date());

    if (amount > 0 && start <= end) {
      if (mode === "create") {
        await budgetService.createBudget(amount, start, end, finalWalletId);
      } else if (mode === "edit" && budgetStatus?.id) {
        await budgetService.updateBudget(budgetStatus.id, {
          amount,
          walletId: finalWalletId,
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
      setSelectedWalletId(budgetStatus.walletId || "all");
      setDateRange({
        from: budgetStatus.periodStart || startOfMonth(new Date()),
        to: budgetStatus.periodEnd || endOfMonth(new Date())
      });
      setMode("edit");
    }
  };

  const openCreateMode = () => {
    setNewBudgetAmount("");
    setSelectedWalletId("all");
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
    return <div className="p-4 max-w-md mx-auto pt-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full bg-blue-200"></div></div>;
  }

  if (!budgetStatus && mode === "view") {
    return (
      <div className="p-4 max-w-md mx-auto h-full flex flex-col items-center justify-center space-y-4">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-xl font-bold">Belum Ada Budget</h2>
        <p className="text-center text-gray-500 text-sm">
          Buat budget untuk mulai mengatur batas pengeluaran harian yang aman.
        </p>
        <button
          onClick={openCreateMode}
          className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold mt-4 hover:bg-blue-700"
        >
          Buat Budget Baru
        </button>
      </div>
    );
  }

  if (mode === "create" || mode === "edit") {
    return (
      <div className="p-4 max-w-md mx-auto h-full flex flex-col justify-center pb-24 relative">
        <h2 className="text-2xl font-bold mb-6">{mode === "create" ? "Tentukan Budget" : "Edit Budget"}</h2>
        <form onSubmit={handleCreateOrEditBudget} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={newBudgetAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full p-4 pl-12 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-2xl font-bold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Berlaku Untuk Dompet
            </label>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">Semua Dompet (Global)</option>
              {wallets?.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Periode Budget
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-left flex justify-between items-center text-sm"
              >
                <span>
                  {dateRange?.from ? format(dateRange.from, "d MMM yyyy", { locale: localeID }) : "Pilih Tanggal"} -{" "}
                  {dateRange?.to ? format(dateRange.to, "d MMM yyyy", { locale: localeID }) : "..."}
                </span>
                <CalendarIcon size={20} className="text-gray-500" />
              </button>

              {showDatePicker && (
                <div className="absolute z-[100] mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-4 right-0 left-0 flex flex-col items-center">
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                  />
                  <div className="mt-2 flex justify-end w-full">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                if (budgetStatus) setMode("view");
                else loadBudget();
              }}
              className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    );
  }

  const { budgetAmount, dailyLimit, todayExpenses, percentageUsed, status, walletId, periodStart, periodEnd } = budgetStatus;
  const linkedWalletName = walletId ? wallets?.find(w => w.id === walletId)?.name || "Dompet Terhapus" : "Semua Dompet";

  // Determine colors based on status
  let statusColor = "bg-green-500 text-white";
  let bgGradient = "from-green-500 to-emerald-600";
  let StatusIcon = CheckCircle2;
  let statusText = "Pengeluaran Aman";

  if (status === 'warning') {
    statusColor = "bg-yellow-500 text-white";
    bgGradient = "from-yellow-400 to-amber-600";
    StatusIcon = AlertTriangle;
    statusText = "Mendekati Limit";
  } else if (status === 'danger') {
    statusColor = "bg-red-500 text-white";
    bgGradient = "from-red-500 to-rose-700";
    StatusIcon = AlertCircle;
    statusText = "Melebihi Limit!";
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pt-8 pb-24">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Budgeting</h1>
        <div className="flex gap-2">
          <button onClick={openEditMode} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Edit2 size={20} />
          </button>
          <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      {/* Daily Limit Card */}
      <div className={`bg-gradient-to-br ${bgGradient} rounded-3xl p-6 text-white shadow-lg relative overflow-hidden`}>
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
          <StatusIcon size={14} />
          {statusText}
        </div>
        
        <h2 className="text-white/90 font-medium mb-1 text-sm">Jatah Jajan Hari Ini</h2>
        <div className="text-4xl font-bold tracking-tight mb-6">
          {formatter.format(dailyLimit)}
        </div>
        
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex justify-between text-sm mb-2">
            <span>Terpakai Hari Ini</span>
            <span className="font-bold">{formatter.format(todayExpenses)}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <div className="text-xs text-white/80 mt-2 text-right">
            {percentageUsed.toFixed(0)}% dari limit harian
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold mb-4">Ringkasan Budget</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Periode</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {periodStart ? format(periodStart, "d MMM yyyy", { locale: localeID }) : "-"} s/d {periodEnd ? format(periodEnd, "d MMM yyyy", { locale: localeID }) : "-"}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Berlaku Untuk</span>
              <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{linkedWalletName}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Total Budget</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{formatter.format(budgetAmount)}</span>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Sisa Budget</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{formatter.format(budgetStatus.remainingBudget)}</span>
            </div>
            {/* Progress */}
            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.min((budgetStatus.totalExpenses / budgetAmount) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
