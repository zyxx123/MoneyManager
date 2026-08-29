"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { walletService } from "@/lib/services/walletService";
import Link from "next/link";
import { Plus, Wallet as WalletIcon, MoreVertical } from "lucide-react";
import { useState } from "react";

export default function WalletsPage() {
  const wallets = useLiveQuery(() => walletService.getAllActive());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/90 backdrop-blur-md">
        <h1 className="text-[24px] font-bold ml-1">Dompet</h1>
        <Link
          href="/wallets/new"
          className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-2xl text-[14px] font-bold hover:bg-primary/20 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
        >
          <Plus size={18} strokeWidth={2.5} />
          Tambah
        </Link>
      </header>

      <div className="flex-1 p-4">
        {wallets === undefined ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-surface border-[3px] border-black rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-text-secondary">
            <div className="w-20 h-20 bg-surface border-[3px] border-black rounded-2xl flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <WalletIcon size={32} className="text-text-secondary/50" />
            </div>
            <p className="font-bold text-[16px] text-text-main">Belum ada dompet</p>
            <p className="text-[14px] mt-1">Buat dompet pertamamu sekarang!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {wallets.map((wallet) => (
              <div key={wallet.id} className="relative pt-3">
                {/* Folder Tab */}
                <div 
                  className="absolute top-0 left-3 w-16 h-6 border-[3px] border-black rounded-t-xl z-0"
                  style={{ backgroundColor: wallet.color }}
                ></div>
                {/* Main Card */}
                <Link
                  href={`/wallets/${wallet.id}/edit`}
                  className="relative z-10 bg-surface border-[3px] border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-full hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200 block"
                >
                  <div 
                    className="w-10 h-10 rounded-xl border-[3px] border-black flex items-center justify-center text-black mb-3 bg-primary"
                    style={{ backgroundColor: wallet.color }}
                  >
                    <WalletIcon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text-main tracking-tight line-clamp-1 mb-1">
                      {wallet.name}
                    </h3>
                    <p className="text-[11px] text-text-secondary capitalize font-bold">{wallet.type}</p>
                    <p className="font-black text-sm text-text-main tracking-tight mt-1 truncate">
                      {formatCurrency(wallet.cachedBalance)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
