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
      <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 dark:bg-gray-950">
        <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setIsCreating(false)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Tujuan Tabungan Baru</h1>
        </header>

        <div className="p-4 pt-8">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Tabungan</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Beli Laptop Baru"
                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Terkumpul</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={targetAmount}
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
              Simpan Target Tabungan
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
          <h1 className="text-xl font-bold ml-2">Tabungan</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-green-700"
        >
          <Plus size={16} />
          Target Baru
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {savings === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
          </div>
        ) : savings.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <PiggyBank size={48} className="mx-auto mb-2 text-gray-400" />
            <p>Belum ada target tabungan.</p>
          </div>
        ) : (
          savings.map(goal => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <div key={goal.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{goal.name}</h3>
                  <button 
                    onClick={() => handleAddFunds(goal.id)}
                    className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-200 transition"
                  >
                    + Nabung
                  </button>
                </div>
                
                <div className="flex justify-between text-sm mb-2 mt-4">
                  <span className="font-semibold text-green-600">{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-gray-500">Target: {formatCurrency(goal.targetAmount)}</span>
                </div>
                
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-right text-xs text-gray-400 mt-1">
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
