"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { transactionService } from "@/lib/services/transactionService";
import { walletService } from "@/lib/services/walletService";
import { categoryService } from "@/lib/services/categoryService";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, Trash2, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
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
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
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
        setDate(trx.date);
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
  const categories = useLiveQuery(() => categoryService.getAllByType(type as any), [type]);

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
        date: date,
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
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-[100px]">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
        <Link href="/" className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-full transition-colors active:translate-y-1 active:translate-x-1 active:shadow-none">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex bg-border-subtle/50 p-1 rounded-[12px] ml-auto">
          {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
              className={`px-4 py-1.5 text-[13px] font-semibold rounded-[10px] transition-all duration-200 capitalize ${
                type === t
                  ? "bg-surface text-text-main shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              {t === "expense" ? "Pengeluaran" : t === "income" ? "Pemasukan" : "Transfer"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 p-5">
        <form id="tx-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Jumlah
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full p-5 pl-14 bg-surface border-2 border-black rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all duration-200 text-3xl font-bold text-text-main shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
                {type === 'transfer' ? 'Dari Dompet' : 'Dompet'}
              </label>
              <select
                required
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full p-4 bg-surface border-2 border-black rounded-lg focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none"
              >
                <option value="" disabled>Pilih Dompet</option>
                {wallets?.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
                  Ke Dompet
                </label>
                <select
                  required
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full p-4 bg-surface border-2 border-black rounded-lg focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none"
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
                <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
                  Kategori
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-4 bg-surface border-2 border-black rounded-lg focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2 relative">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Tanggal
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="w-full p-4 bg-surface border-2 border-black rounded-lg focus:ring-1 focus:ring-primary outline-none text-left flex justify-between items-center text-[15px] font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-transform"
              >
                <span>{format(date, "d MMMM yyyy", { locale: localeID })}</span>
                <CalendarIcon size={20} className="text-text-secondary" />
              </button>

              {showDatePicker && (
                <div className="absolute z-[100] mt-2 bg-surface border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 right-0 left-0 flex flex-col items-center">
                  <DayPicker
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (d) {
                        setDate(d);
                        setShowDatePicker(false);
                      }
                    }}
                  />
                  <div className="mt-4 flex justify-end w-full border-t-2 border-black pt-3">
                    <button
                      type="button"
                      onClick={() => setShowDatePicker(false)}
                      className="bg-border-subtle/50 text-text-main px-5 py-2.5 rounded-[12px] font-semibold text-[14px] hover:bg-border-subtle active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Catatan
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Makan siang, bensin..."
              className="w-full p-4 bg-surface border-2 border-black rounded-lg focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-3">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="col-span-1 flex items-center justify-center py-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-900/40 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
          >
            <Trash2 size={24} />
          </button>
          <button
            type="submit"
            form="tx-form"
            disabled={!amount || !walletId}
            className="col-span-3 py-4 bg-primary text-white rounded-full font-semibold text-[16px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
