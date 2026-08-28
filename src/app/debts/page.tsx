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
      <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 dark:bg-gray-950">
        <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setIsCreating(false)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Catat Hutang/Piutang</h1>
        </header>

        <div className="p-4 pt-8">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDirection("payable")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  direction === "payable"
                    ? "bg-white dark:bg-gray-700 text-red-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Saya Berhutang
              </button>
              <button
                type="button"
                onClick={() => setDirection("receivable")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  direction === "receivable"
                    ? "bg-white dark:bg-gray-700 text-green-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Orang Berhutang
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {direction === 'payable' ? 'Kepada Siapa / Untuk Apa' : 'Siapa yang Berhutang'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi, Pinjol X"
                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Nominal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full p-3 pl-12 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Simpan
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <Link href="/more" className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold ml-2">Hutang & Piutang</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-red-700"
        >
          <Plus size={16} />
          Catat Baru
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {debts === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <CreditCard size={48} className="mx-auto mb-2 text-gray-400" />
            <p>Bebas hutang! Lanjutkan!</p>
          </div>
        ) : (
          debts.map(debt => {
            const isPayable = debt.direction === 'payable';
            const percentage = ((debt.amount - debt.remainingAmount) / debt.amount) * 100;
            
            return (
              <div key={debt.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isPayable ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                      {isPayable ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100">{debt.name}</h3>
                      <p className="text-xs text-gray-500">{isPayable ? 'Hutang Saya' : 'Piutang Orang'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddPayment(debt.id, debt.remainingAmount)}
                    className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition"
                  >
                    + Bayar
                  </button>
                </div>
                
                <div className="flex justify-between text-sm mb-2">
                  <span className={`font-semibold ${isPayable ? 'text-red-600' : 'text-green-600'}`}>
                    Sisa: {formatCurrency(debt.remainingAmount)}
                  </span>
                  <span className="text-gray-500">Total: {formatCurrency(debt.amount)}</span>
                </div>
                
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isPayable ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-400 mt-1">
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
