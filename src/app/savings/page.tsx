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
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
        <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
          <button onClick={() => setIsCreating(false)} className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-full transition-colors active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-semibold ml-2">Target Tabungan Baru</h1>
        </header>

        <div className="flex-1 p-5">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">Nama Tabungan</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Beli Laptop Baru"
                className="w-full p-4 bg-surface border border-border-subtle rounded-[16px] focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">Target Terkumpul</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={targetAmount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full p-5 pl-14 bg-surface border border-border-subtle rounded-[20px] focus:ring-1 focus:ring-primary outline-none transition-all text-3xl font-bold text-text-main shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name || !targetAmount}
              className="w-full py-4 mt-4 bg-primary text-white rounded-full font-semibold text-[16px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-[0_8px_16px_rgba(47,111,78,0.2)]"
            >
              Simpan Target
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/90 backdrop-blur-md">
        <div className="flex items-center">
          <Link href="/more" className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-full transition-colors active:scale-95">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-[24px] font-bold ml-2">Tabungan</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-full text-[14px] font-semibold hover:bg-primary/20 active:scale-95 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
          Target
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {savings === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-surface rounded-[24px]" />)}
          </div>
        ) : savings.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-text-secondary">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <PiggyBank size={32} className="text-text-secondary/50" />
            </div>
            <p className="font-semibold text-[16px] text-text-main">Belum ada target</p>
            <p className="text-[14px] mt-1">Buat target tabungan pertamamu!</p>
          </div>
        ) : (
          savings.map(goal => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <div key={goal.id} className="bg-surface border border-border-subtle rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-[17px] text-text-main tracking-tight">{goal.name}</h3>
                  <button 
                    onClick={() => handleAddFunds(goal.id)}
                    className="text-[13px] bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold hover:bg-primary/20 active:scale-95 transition-all"
                  >
                    + Nabung
                  </button>
                </div>
                
                <div className="flex justify-between text-[14px] mb-3 mt-5">
                  <span className="font-bold text-income">{formatCurrency(goal.currentAmount)}</span>
                  <span className="font-medium text-text-secondary text-[13px]">Target: {formatCurrency(goal.targetAmount)}</span>
                </div>
                
                <div className="h-2.5 w-full bg-border-subtle/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-right text-[12px] font-medium text-text-secondary mt-2">
                  {percentage.toFixed(1)}% Terkumpul
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
