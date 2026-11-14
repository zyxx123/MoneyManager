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
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 animate-fade-in-up">
        <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
          <button onClick={() => setIsCreating(false)} className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main press-spring tap-pill">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[20px] font-bold ml-3 tracking-tight">Catat Hutang/Piutang</h1>
        </header>

        <div className="flex-1 p-5">
          <form onSubmit={handleCreate} className="space-y-5">
            {/* Direction Switcher */}
            <div className="flex bg-surface-muted p-1 rounded-full border border-border/80">
              <button
                type="button"
                onClick={() => setDirection("payable")}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-spring press-spring tap-pill ${
                  direction === "payable"
                    ? "bg-[#083328] text-white shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Saya Berhutang
              </button>
              <button
                type="button"
                onClick={() => setDirection("receivable")}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-spring press-spring tap-pill ${
                  direction === "receivable"
                    ? "bg-[#083328] text-white shadow-sm"
                    : "text-text-secondary hover:text-text-main"
                }`}
              >
                Orang Berhutang
              </button>
            </div>

            <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-fintech space-y-2 card-smooth">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                {direction === 'payable' ? 'Kepada Siapa / Untuk Apa' : 'Siapa yang Berhutang'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi, Pinjol X"
                className="w-full p-4 bg-surface-muted border border-border/80 rounded-2xl outline-none text-[15px] font-semibold text-text-main focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth"
              />
            </div>
            
            <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-fintech space-y-2 card-smooth">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                Nominal
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full p-4 pl-12 bg-surface-muted border border-border/80 rounded-2xl outline-none text-2xl font-bold text-text-main focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name || !amount}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] rounded-full font-bold text-[15px] shadow-lime-glow hover:shadow-lime-glow-lg disabled:opacity-50 disabled:cursor-not-allowed press-spring tap-pill"
            >
              Simpan
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 animate-fade-in-up">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/90 backdrop-blur-md">
        <div className="flex items-center">
          <Link href="/more" className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main press-spring tap-pill">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-bold ml-3 tracking-tight">Hutang & Piutang</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] px-4 py-2 rounded-full text-xs font-bold shadow-lime-glow hover:shadow-lime-glow-lg press-spring tap-pill"
        >
          <Plus size={16} strokeWidth={2.8} />
          <span>Tambah</span>
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {debts === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-surface rounded-3xl border border-border/80" />)}
          </div>
        ) : debts.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 text-text-secondary animate-fade-in">
            <div className="w-16 h-16 bg-[#EBF7F2] dark:bg-[#14382E] text-[#083328] dark:text-[#A3F03A] rounded-3xl flex items-center justify-center mb-3 animate-bounce-subtle">
              <CreditCard size={28} />
            </div>
            <p className="font-bold text-[15px] text-text-main">Tidak Ada Hutang / Piutang</p>
            <p className="text-[13px] mt-0.5">Catat pinjaman atau tagihan teman Anda.</p>
          </div>
        ) : (
          debts.map((debt, idx) => {
            const isPayable = debt.direction === "payable";
            const paid = debt.amount - debt.remainingAmount;
            const percentage = Math.min((paid / debt.amount) * 100, 100);
            
            return (
              <div key={debt.id} className={`bg-surface rounded-3xl p-5 border border-border/80 shadow-fintech space-y-3 card-smooth stagger-${Math.min(idx + 1, 8)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isPayable ? "bg-red-50 text-red-500 dark:bg-red-950/40" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                    }`}>
                      {isPayable ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-[16px] text-text-main tracking-tight">{debt.name}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {isPayable ? "Hutang Anda" : "Piutang Teman"}
                      </p>
                    </div>
                  </div>
                  
                  {debt.remainingAmount > 0 ? (
                    <button 
                      onClick={() => handleAddPayment(debt.id, debt.remainingAmount)}
                      className="text-xs bg-[#EBF7F2] dark:bg-[#14382E] text-[#083328] dark:text-[#A3F03A] hover:bg-[#A3F03A] hover:text-[#083328] px-3.5 py-1.5 rounded-full font-bold press-spring tap-pill"
                    >
                      Bayar
                    </button>
                  ) : (
                    <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full font-bold">
                      Lunas
                    </span>
                  )}
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold text-text-main">Sisa: {formatCurrency(debt.remainingAmount)}</span>
                    <span className="text-text-secondary">Total: {formatCurrency(debt.amount)}</span>
                  </div>
                  
                  <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${isPayable ? "bg-red-400" : "bg-[#A3F03A]"}`}
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
