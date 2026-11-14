"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { walletService } from "@/lib/services/walletService";
import Link from "next/link";
import { Plus, Wallet as WalletIcon, ChevronRight } from "lucide-react";

export default function WalletsPage() {
  const wallets = useLiveQuery(() => walletService.getAllActive());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBalance = wallets
    ?.filter(w => w.type !== 'savings')
    .reduce((sum, w) => sum + w.cachedBalance, 0) ?? 0;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 animate-fade-in-up">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/90 backdrop-blur-md">
        <h1 className="text-[22px] font-bold ml-1 tracking-tight">Dompet Saya</h1>
        <Link
          href="/wallets/new"
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] px-4 py-2 rounded-full text-xs font-bold shadow-lime-glow hover:shadow-lime-glow-lg press-spring tap-pill"
        >
          <Plus size={16} strokeWidth={2.8} />
          <span>Tambah</span>
        </Link>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {/* Total Saldo Card */}
        <div className="bg-[#083328] rounded-[32px] p-6 text-white shadow-[0_12px_36px_rgba(8,51,40,0.35)] relative overflow-hidden card-smooth border border-white/10">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#A3F03A]/20 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>
          <p className="text-white/70 text-xs font-normal mb-1">Total Saldo Dompet</p>
          <div className="text-3xl font-bold text-white tracking-tight transition-smooth">
            {wallets === undefined ? "Menghitung..." : formatCurrency(totalBalance)}
          </div>
          <p className="text-[11px] text-white/60 mt-1.5">
            {wallets?.length ?? 0} dompet aktif terdaftar
          </p>
        </div>

        {wallets === undefined ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bubble-card animate-pulse" />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 text-text-secondary animate-fade-in bubble-card p-8 text-center">
            <div className="w-16 h-16 bg-[#083328]/10 dark:bg-white/10 text-[#083328] dark:text-[#A3F03A] rounded-full flex items-center justify-center mb-3 animate-bounce-subtle">
              <WalletIcon size={28} />
            </div>
            <p className="font-bold text-[16px] text-text-main">Belum Ada Dompet</p>
            <p className="text-[13px] mt-1 text-text-secondary">Buat dompet pertamamu sekarang!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet, idx) => (
              <Link
                key={wallet.id}
                href={`/wallets/${wallet.id}/edit`}
                className={`bubble-item rounded-[26px] p-4 flex items-center justify-between card-smooth press-spring block group stagger-${Math.min(idx + 1, 8)}`}
              >
                <div className="flex items-center gap-3.5">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-108"
                    style={{ backgroundColor: wallet.color || "#083328" }}
                  >
                    <WalletIcon size={22} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-text-main tracking-tight line-clamp-1 group-hover:text-[#083328] dark:group-hover:text-[#A3F03A] transition-colors">
                      {wallet.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-semibold text-text-secondary bg-[#083328]/5 dark:bg-white/5 px-2.5 py-0.5 rounded-full capitalize">
                        {wallet.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="font-bold text-[15px] text-text-main tracking-tight">
                      {formatCurrency(wallet.cachedBalance)}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-text-secondary/50 group-hover:translate-x-0.5 group-hover:text-text-main transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
