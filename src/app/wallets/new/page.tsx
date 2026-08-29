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
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-[80px]">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
        <Link href="/wallets" className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-full transition-colors active:scale-95">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-[20px] font-semibold ml-2">Dompet Baru</h1>
      </header>

      <div className="flex-1 p-5">
        <form id="wallet-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Nama Dompet
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Utama, Uang Makan"
              className="w-full p-4 bg-surface border border-border-subtle rounded-[16px] focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Tipe Dompet
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WALLET_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as any)}
                  className={`p-3 text-[13px] font-semibold rounded-[14px] text-center transition-all ${
                    type === t.value
                      ? "bg-primary-soft text-primary shadow-sm border border-primary/20"
                      : "bg-surface border border-border-subtle text-text-secondary hover:text-text-main"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Warna
            </label>
            <div className="flex gap-4 flex-wrap bg-surface p-4 border border-border-subtle rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] justify-center">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${color === c ? 'scale-110 shadow-lg ring-2 ring-primary ring-offset-2 dark:ring-offset-background' : 'hover:scale-105 shadow-sm'}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={22} className="text-white drop-shadow-md" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Saldo Awal
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={balance}
                onChange={handleBalanceChange}
                placeholder="0"
                className="w-full p-5 pl-14 bg-surface border border-border-subtle rounded-[20px] focus:ring-1 focus:ring-primary outline-none transition-all text-3xl font-bold text-text-main shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            form="wallet-form"
            disabled={!name}
            className="w-full py-4 bg-primary text-white rounded-full font-semibold text-[16px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-[0_8px_16px_rgba(47,111,78,0.2)]"
          >
            Simpan Dompet
          </button>
        </div>
      </div>
    </div>
  );
}
