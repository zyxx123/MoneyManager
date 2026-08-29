"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { debtService } from "@/lib/services/debtService";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Plus, ArrowLeft, ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type DebtDirection = "payable" | "receivable";

export default function DebtsPage() {
  const debts = useLiveQuery(() => debtService.getAllActive());
  const [isCreating, setIsCreating] = useState(false);
  
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<DebtDirection>("payable");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setAmount("");
      return;
    }
    setAmount(new Intl.NumberFormat("id-ID").format(Number(raw)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = Number(amount.replace(/\D/g, ""));
    if (name && rawAmount > 0) {
      await debtService.create({ name, amount: rawAmount, direction });
      setIsCreating(false);
      setName("");
      setAmount("");
      setDirection("payable");
    }
  };

  const handleAddPayment = async (id: string, maxAmount: number) => {
    const amountStr = prompt(`Berapa nominal pembayaran cicilan ini? (Maks: ${formatCurrency(maxAmount)})`);
    if (!amountStr) return;
    const payment = Number(amountStr.replace(/\D/g, ""));
    if (payment > 0) {
      await debtService.addPayment(id, Math.min(payment, maxAmount));
    }
  };

  if (isCreating) {
    return (
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
        <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
          <button onClick={() => setIsCreating(false)} className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-2xl transition-colors active:translate-y-1 active:translate-x-1 active:shadow-none">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-bold ml-2">Catat Hutang/Piutang</h1>
        </header>

        <div className="flex-1 p-5">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="flex bg-surface border-[3px] border-black p-1 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <button
                type="button"
                onClick={() => setDirection("payable")}
                className={`flex-1 py-2.5 text-[14px] font-bold rounded-[12px] transition-all duration-200 ${
                  direction === "payable"
                    ? "bg-expense/10 text-expense shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-expense/20"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Saya Berhutang
              </button>
              <button
                type="button"
                onClick={() => setDirection("receivable")}
                className={`flex-1 py-2.5 text-[14px] font-bold rounded-[12px] transition-all duration-200 ${
                  direction === "receivable"
                    ? "bg-income/10 text-income shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-income/20"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Orang Berhutang
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-text-secondary uppercase tracking-wider ml-1">
                {direction === 'payable' ? 'Kepada Siapa / Untuk Apa' : 'Siapa yang Berhutang'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi, Pinjol X"
                className="w-full p-4 bg-surface border-[3px] border-black rounded-2xl focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-text-secondary uppercase tracking-wider ml-1">Total Nominal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full p-5 pl-14 bg-surface border-[3px] border-black rounded-2xl focus:ring-1 focus:ring-primary outline-none transition-all duration-200 text-3xl font-bold text-text-main shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name || !amount}
              className="w-full py-4 mt-4 bg-primary text-white rounded-2xl font-bold text-[16px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black"
            >
              Simpan
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
          <h1 className="text-[24px] font-bold ml-2">Hutang & Piutang</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 bg-expense/10 text-expense px-4 py-2 rounded-2xl text-[14px] font-bold hover:bg-expense/20 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
        >
          <Plus size={18} strokeWidth={2.5} />
          Catat Baru
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {debts === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-surface rounded-2xl" />)}
          </div>
        ) : debts.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-text-secondary">
            <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CreditCard size={32} className="text-text-secondary/50" />
            </div>
            <p className="font-bold text-[16px] text-text-main">Bebas hutang!</p>
            <p className="text-[14px] mt-1">Lanjutkan kebiasaan baik ini.</p>
          </div>
        ) : (
          debts.map(debt => {
            const isPayable = debt.direction === 'payable';
            const percentage = ((debt.amount - debt.remainingAmount) / debt.amount) * 100;
            
            return (
              <div key={debt.id} className="bg-surface border-[3px] border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.2)] ${isPayable ? 'bg-expense/10 text-expense' : 'bg-income/10 text-income'}`}>
                      {isPayable ? <ArrowUpRight size={22} strokeWidth={2} /> : <ArrowDownRight size={22} strokeWidth={2} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-[17px] text-text-main tracking-tight">{debt.name}</h3>
                      <p className="text-[13px] font-medium text-text-secondary mt-0.5">{isPayable ? 'Hutang Saya' : 'Piutang Orang'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddPayment(debt.id, debt.remainingAmount)}
                    className="text-[13px] bg-border-subtle/50 text-text-main px-3 py-1.5 rounded-2xl font-bold hover:bg-border-subtle active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
                  >
                    + Bayar
                  </button>
                </div>
                
                <div className="flex justify-between text-[14px] mb-3">
                  <span className={`font-bold ${isPayable ? 'text-expense' : 'text-income'}`}>
                    Sisa: {formatCurrency(debt.remainingAmount)}
                  </span>
                  <span className="font-medium text-text-secondary text-[13px]">Total: {formatCurrency(debt.amount)}</span>
                </div>
                
                <div className="h-2.5 w-full bg-border-subtle/50 rounded-2xl overflow-hidden">
                  <div 
                    className={`h-full rounded-2xl transition-all duration-200 duration-700 ease-out ${isPayable ? 'bg-expense' : 'bg-income'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-right text-[12px] font-medium text-text-secondary mt-2">
                  {percentage.toFixed(1)}% Lunas
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
