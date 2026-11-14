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
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/90 backdrop-blur-md">
        <h1 className="text-[22px] font-bold ml-1 tracking-tight">Dompet Saya</h1>
        <Link
          href="/wallets/new"
          className="flex items-center gap-1.5 bg-[#A3F03A] text-[#083328] px-4 py-2 rounded-full text-xs font-bold shadow-[0_4px_12px_rgba(163,240,58,0.35)] active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={2.8} />
          <span>Tambah</span>
        </Link>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {/* Total Saldo Card */}
        <div className="bg-[#083328] rounded-3xl p-5 text-white shadow-[0_8px_30px_rgba(8,51,40,0.25)] relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#A3F03A]/15 rounded-full blur-2xl pointer-events-none"></div>
          <p className="text-white/70 text-xs font-normal mb-1">Total Saldo Dompet</p>
          <div className="text-2xl font-bold text-white tracking-tight">
            {wallets === undefined ? "Menghitung..." : formatCurrency(totalBalance)}
          </div>
          <p className="text-[11px] text-white/60 mt-1">
            {wallets?.length ?? 0} dompet aktif terdaftar
          </p>
        </div>

        {wallets === undefined ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-surface rounded-3xl border border-border/80 animate-pulse" />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 text-text-secondary">
            <div className="w-16 h-16 bg-[#EBF7F2] dark:bg-[#14382E] text-[#083328] dark:text-[#A3F03A] rounded-3xl flex items-center justify-center mb-3">
              <WalletIcon size={28} />
            </div>
            <p className="font-bold text-[15px] text-text-main">Belum Ada Dompet</p>
            <p className="text-[13px] mt-0.5">Buat dompet pertamamu sekarang!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <Link
                key={wallet.id}
                href={`/wallets/${wallet.id}/edit`}
                className="bg-surface rounded-3xl p-4 border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between hover:shadow-md active:scale-[0.99] transition-all block"
              >
                <div className="flex items-center gap-3.5">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: wallet.color || "#083328" }}
                  >
                    <WalletIcon size={22} strokeWidth={2.2} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[15px] text-text-main tracking-tight line-clamp-1">
                      {wallet.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-semibold text-text-secondary bg-surface-muted px-2 py-0.5 rounded-full capitalize">
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
                  <ChevronRight size={16} className="text-text-secondary/50" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
