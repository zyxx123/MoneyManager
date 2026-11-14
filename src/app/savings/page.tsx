"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { savingsService } from "@/lib/services/savingsService";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SavingsPage() {
  const savings = useLiveQuery(() => savingsService.getAllActive());
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setTargetAmount("");
      return;
    }
    setTargetAmount(new Intl.NumberFormat("id-ID").format(Number(raw)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(targetAmount.replace(/\D/g, ""));
    if (name && amount > 0) {
      await savingsService.create({ name, targetAmount: amount });
      setIsCreating(false);
      setName("");
      setTargetAmount("");
    }
  };

  const handleAddFunds = async (id: string) => {
    const amountStr = prompt("Berapa jumlah yang ingin disisihkan ke tabungan ini?");
    if (!amountStr) return;
    const amount = Number(amountStr.replace(/\D/g, ""));
    if (amount > 0) {
      await savingsService.addFunds(id, amount);
    }
  };

  if (isCreating) {
    return (
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28">
        <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
          <button onClick={() => setIsCreating(false)} className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main transition-colors active:scale-95">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[20px] font-bold ml-3 tracking-tight">Target Tabungan Baru</h1>
        </header>

        <div className="flex-1 p-5">
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Nama Tabungan</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Beli Laptop Baru, Dana Liburan"
                className="w-full p-4 bg-surface-muted border border-border/80 rounded-2xl outline-none text-[15px] font-semibold text-text-main focus:ring-2 focus:ring-[#A3F03A]"
              />
            </div>
            
            <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Target Terkumpul</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={targetAmount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full p-4 pl-12 bg-surface-muted border border-border/80 rounded-2xl outline-none text-2xl font-bold text-text-main focus:ring-2 focus:ring-[#A3F03A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name || !targetAmount}
              className="w-full py-3.5 mt-2 bg-[#A3F03A] text-[#083328] rounded-full font-bold text-[15px] shadow-[0_4px_14px_rgba(163,240,58,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
            >
              Simpan Target
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/90 backdrop-blur-md">
        <div className="flex items-center">
          <Link href="/more" className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main transition-colors active:scale-95">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-bold ml-3 tracking-tight">Tabungan & Goals</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 bg-[#A3F03A] text-[#083328] px-4 py-2 rounded-full text-xs font-bold shadow-[0_4px_12px_rgba(163,240,58,0.35)] active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={2.8} />
          <span>Target</span>
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {savings === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-surface rounded-3xl border border-border/80" />)}
          </div>
        ) : savings.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 text-text-secondary">
            <div className="w-16 h-16 bg-[#EBF7F2] dark:bg-[#14382E] text-[#083328] dark:text-[#A3F03A] rounded-3xl flex items-center justify-center mb-3">
              <PiggyBank size={28} />
            </div>
            <p className="font-bold text-[15px] text-text-main">Belum Ada Target</p>
            <p className="text-[13px] mt-0.5">Buat target tabungan pertamamu!</p>
          </div>
        ) : (
          savings.map(goal => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <div key={goal.id} className="bg-surface rounded-3xl p-5 border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-[16px] text-text-main tracking-tight">{goal.name}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">Target: {formatCurrency(goal.targetAmount)}</p>
                  </div>
                  <button 
                    onClick={() => handleAddFunds(goal.id)}
                    className="text-xs bg-[#EBF7F2] dark:bg-[#14382E] text-[#083328] dark:text-[#A3F03A] hover:bg-[#A3F03A] hover:text-[#083328] px-3.5 py-1.5 rounded-full font-bold transition-all active:scale-95"
                  >
                    + Nabung
                  </button>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold text-income">{formatCurrency(goal.currentAmount)}</span>
                    <span className="font-semibold text-text-secondary">{percentage.toFixed(1)}%</span>
                  </div>
                  
                  {/* Lime Progress Bar */}
                  <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#A3F03A] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
