"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { walletService } from "@/lib/services/walletService";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { type Wallet } from "@/lib/db";

const WALLET_TYPES = [
  { value: "cash", label: "Tunai" },
  { value: "bank", label: "Bank" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "savings", label: "Tabungan" },
  { value: "credit_card", label: "Kartu Kredit" },
  { value: "other", label: "Lainnya" },
];

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
  "#8b5cf6", "#ec4899", "#14b8a6", "#64748b"
];

export default function NewWalletPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<Wallet["type"]>("bank");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await walletService.create({
        name,
        type,
        openingBalance: Number(balance.replace(/\D/g, "")) || 0,
        icon: "wallet", // Default icon for now
        color,
        currency: "IDR", // Default from app settings in real app
        isArchived: false,
        sortOrder: 0,
      });
      router.push("/wallets");
    } catch (error) {
      console.error("Failed to create wallet:", error);
      alert("Gagal membuat dompet");
    }
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setBalance("");
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(Number(raw));
    setBalance(formatted);
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Link href="/wallets" className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold ml-2">Dompet Baru</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <form id="wallet-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Dompet
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Utama, Uang Makan"
              className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipe Dompet
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WALLET_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as any)}
                  className={`p-2 text-sm rounded-lg border text-center transition-colors ${
                    type === t.value
                      ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Warna
            </label>
            <div className="flex gap-3 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={20} className="text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Saldo Awal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={balance}
                onChange={handleBalanceChange}
                placeholder="0"
                className="w-full p-3 pl-12 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-lg font-semibold"
              />
            </div>
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          type="submit"
          form="wallet-form"
          disabled={!name}
          className="w-full max-w-md mx-auto block py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Simpan Dompet
        </button>
      </div>
    </div>
  );
}
