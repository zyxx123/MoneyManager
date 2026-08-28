"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { transactionService } from "@/lib/services/transactionService";
import { walletService } from "@/lib/services/walletService";
import { categoryService } from "@/lib/services/categoryService";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { db } from "@/lib/db";

type TransactionType = "expense" | "income" | "transfer";

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchTrx = async () => {
      try {
        const trx = await db.transactions.get(id);
        if (!trx) {
          alert("Transaksi tidak ditemukan");
          router.push("/");
          return;
        }
        setType(trx.type);
        setAmount(new Intl.NumberFormat("id-ID").format(trx.amount));
        setWalletId(trx.walletId);
        setToWalletId(trx.toWalletId || "");
        setCategoryId(trx.categoryId || "");
        setDate(format(trx.date, "yyyy-MM-dd"));
        setNote(trx.note || "");
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    fetchTrx();
  }, [id, router]);

  const wallets = useLiveQuery(() => walletService.getAllActive());
  const categories = useLiveQuery(() => categoryService.getAllByType(type as any));

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setAmount("");
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(Number(raw));
    setAmount(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = Number(amount.replace(/\D/g, ""));
    
    if (!rawAmount || !walletId || !date) return;
    if (type !== 'transfer' && !categoryId) return;
    if (type === 'transfer' && (!toWalletId || walletId === toWalletId)) {
      alert("Pilih dompet tujuan yang berbeda!");
      return;
    }

    try {
      await transactionService.update(id, {
        type,
        amount: rawAmount,
        walletId,
        toWalletId: type === 'transfer' ? toWalletId : undefined,
        categoryId: type !== 'transfer' ? categoryId : undefined,
        date: new Date(date),
        note,
      });
      router.back();
    } catch (error) {
      console.error("Failed to update transaction:", error);
      alert("Gagal mengupdate transaksi");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;
    try {
      await transactionService.delete(id);
      router.back();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
      alert("Gagal menghapus transaksi");
    }
  };

  if (isLoading) return <div className="p-8 text-center">Memuat...</div>;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
          <ArrowLeft size={24} />
        </button>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg ml-auto mr-4">
          {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors capitalize ${
                type === t
                  ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {t === "expense" ? "Pengeluaran" : t === "income" ? "Pemasukan" : "Transfer"}
            </button>
          ))}
        </div>
        <button type="button" onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
          <Trash2 size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <form id="tx-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Jumlah
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full p-4 pl-12 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition text-3xl font-bold text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {type === 'transfer' ? 'Dari Dompet' : 'Dompet'}
              </label>
              <select
                required
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="" disabled>Pilih Dompet</option>
                {wallets?.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ke Dompet
                </label>
                <select
                  required
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" disabled>Pilih Tujuan</option>
                  {wallets?.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            {type !== 'transfer' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kategori
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tanggal
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Makan siang, beli bensin..."
              className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          type="submit"
          form="tx-form"
          disabled={!amount || !walletId}
          className="w-full max-w-md mx-auto block py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
