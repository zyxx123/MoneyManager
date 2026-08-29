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
          <button onClick={() => setIsCreating(false)} className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-2xl transition-colors active:translate-y-1 active:translate-x-1 active:shadow-none">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-bold ml-2">Target Tabungan Baru</h1>
        </header>

        <div className="flex-1 p-5">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-text-secondary uppercase tracking-wider ml-1">Nama Tabungan</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Beli Laptop Baru"
                className="w-full p-4 bg-surface border-[3px] border-black rounded-2xl focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-text-secondary uppercase tracking-wider ml-1">Target Terkumpul</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={targetAmount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full p-5 pl-14 bg-surface border-[3px] border-black rounded-2xl focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-3xl font-bold text-text-main shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name || !targetAmount}
              className="w-full py-4 mt-4 bg-primary text-white rounded-2xl font-bold text-[16px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black"
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
          <Link href="/more" className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-2xl transition-colors active:translate-y-1 active:translate-x-1 active:shadow-none">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-[24px] font-bold ml-2">Tabungan</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-2xl text-[14px] font-bold hover:bg-primary/20 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
        >
          <Plus size={18} strokeWidth={2.5} />
          Target
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {savings === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-surface rounded-2xl" />)}
          </div>
        ) : savings.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-text-secondary">
            <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <PiggyBank size={32} className="text-text-secondary/50" />
            </div>
            <p className="font-bold text-[16px] text-text-main">Belum ada target</p>
            <p className="text-[14px] mt-1">Buat target tabungan pertamamu!</p>
          </div>
        ) : (
          savings.map(goal => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <div key={goal.id} className="bg-surface border-[3px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-[17px] text-text-main tracking-tight">{goal.name}</h3>
                  <button 
                    onClick={() => handleAddFunds(goal.id)}
                    className="text-[13px] bg-primary/10 text-primary px-3 py-1.5 rounded-2xl font-bold hover:bg-primary/20 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
                  >
                    + Nabung
                  </button>
                </div>
                
                <div className="flex justify-between text-[14px] mb-3 mt-5">
                  <span className="font-bold text-income">{formatCurrency(goal.currentAmount)}</span>
                  <span className="font-medium text-text-secondary text-[13px]">Target: {formatCurrency(goal.targetAmount)}</span>
                </div>
                
                <div className="h-2.5 w-full bg-border-subtle/50 rounded-2xl overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-2xl transition-all duration-200 duration-700 ease-out"
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
