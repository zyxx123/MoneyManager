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
          className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-none text-[14px] font-semibold hover:bg-primary/20 active:translate-y-1.5 active:translate-x-1.5 active:shadow-none transition-all duration-200"
        >
          <Plus size={18} strokeWidth={2.5} />
          Tambah
        </Link>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {wallets === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-surface rounded-none" />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-text-secondary">
            <div className="w-20 h-20 bg-surface rounded-none flex items-center justify-center mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <WalletIcon size={32} className="text-text-secondary/50" />
            </div>
            <p className="font-semibold text-[16px] text-text-main">Belum ada dompet</p>
            <p className="text-[14px] mt-1">Buat dompet pertamamu sekarang!</p>
          </div>
        ) : (
          wallets.map((wallet) => (
            <Link
              href={`/wallets/${wallet.id}/edit`}
              key={wallet.id}
              className="bg-surface border-[3px] border-black rounded-none p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-1.5 active:translate-x-1.5 active:shadow-none transition-all duration-200 cursor-pointer block"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-none flex items-center justify-center text-white shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.2)]"
                  style={{ backgroundColor: wallet.color }}
                >
                  <WalletIcon size={26} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-[17px] text-text-main tracking-tight">
                    {wallet.name}
                  </h3>
                  <p className="text-[13px] text-text-secondary capitalize font-medium">{wallet.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[17px] text-text-main tracking-tight">
                  {formatCurrency(wallet.cachedBalance)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
