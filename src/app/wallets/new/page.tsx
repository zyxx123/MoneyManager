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
  "#083328", "#10b981", "#3b82f6", "#ef4444", 
  "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"
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
        icon: "wallet",
        color,
        currency: "IDR",
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
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 animate-fade-in-up">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
        <Link href="/wallets" className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main press-spring tap-pill">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-[20px] font-bold ml-3 tracking-tight">Dompet Baru</h1>
      </header>

      <div className="flex-1 p-5">
        <form id="wallet-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-fintech space-y-2 card-smooth">
            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Nama Dompet
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Utama, Cash Dompet"
              className="w-full p-4 bg-surface-muted border border-border/80 rounded-2xl outline-none text-[15px] font-semibold text-text-main focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth"
            />
          </div>

          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-fintech space-y-3 card-smooth">
            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Tipe Dompet
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WALLET_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as any)}
                  className={`p-3 text-[13px] font-bold rounded-2xl text-center transition-spring press-spring tap-pill ${
                    type === t.value
                      ? "bg-[#083328] text-white shadow-md scale-[1.02]"
                      : "bg-surface-muted text-text-secondary hover:bg-black/5"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-fintech space-y-3 card-smooth">
            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Warna Dompet
            </label>
            <div className="flex gap-3 flex-wrap justify-center pt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-spring press-spring tap-pill ${color === c ? 'scale-115 shadow-md ring-2 ring-[#083328] dark:ring-[#A3F03A]' : 'hover:scale-105 opacity-80'}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={18} className="text-white drop-shadow-md" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-fintech space-y-2 card-smooth">
            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
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
                className="w-full p-4 pl-12 bg-surface-muted border border-border/80 rounded-2xl outline-none text-2xl font-bold text-text-main focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth"
              />
            </div>
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))] z-20">
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            form="wallet-form"
            disabled={!name}
            className="w-full py-3.5 bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] rounded-full font-bold text-[15px] shadow-lime-glow hover:shadow-lime-glow-lg disabled:opacity-50 disabled:cursor-not-allowed press-spring tap-pill"
          >
            Simpan Dompet
          </button>
        </div>
      </div>
    </div>
  );
}
