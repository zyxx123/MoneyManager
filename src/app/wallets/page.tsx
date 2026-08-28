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
    <div className="p-4 max-w-md mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dompet</h1>
        <Link
          href="/wallets/new"
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} />
          Tambah
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-24">
        {wallets === undefined ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <WalletIcon size={48} className="mx-auto mb-2 text-gray-400" />
            <p>Belum ada dompet.</p>
            <p className="text-sm">Buat dompet pertamamu sekarang!</p>
          </div>
        ) : (
          wallets.map((wallet) => (
            <Link
              href={`/wallets/${wallet.id}/edit`}
              key={wallet.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm flex items-center justify-between hover:border-blue-200 dark:hover:border-blue-900 transition-colors cursor-pointer block"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-inner"
                  style={{ backgroundColor: wallet.color }}
                >
                  <WalletIcon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {wallet.name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{wallet.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-gray-100">
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
