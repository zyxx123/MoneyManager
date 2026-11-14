"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { transactionService } from "@/lib/services/transactionService";
import { walletService } from "@/lib/services/walletService";
import { categoryService } from "@/lib/services/categoryService";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, CalendarIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

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

  const wallets = useLiveQuery(() => walletService.getAllActive());
  const categories = useLiveQuery(() => categoryService.getAllByType(type as any), [type]);

  useEffect(() => {
    if (!id) return;
    const fetchTransaction = async () => {
      try {
        const trx = await transactionService.getAll().then(list => list.find(t => t.id === id));
        if (!trx) {
          alert("Transaksi tidak ditemukan");
          router.push("/");
          return;
        }
        setType(trx.type);
        setAmount(new Intl.NumberFormat("id-ID").format(trx.amount));
        setWalletId(trx.walletId);
        if (trx.toWalletId) setToWalletId(trx.toWalletId);
        if (trx.categoryId) setCategoryId(trx.categoryId);
        setDate(new Date(trx.date));
        if (trx.note) setNote(trx.note);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    fetchTransaction();
  }, [id, router]);

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

  if (isLoading) return <div className="p-8 text-center text-xs text-text-secondary">Memuat transaksi...</div>;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/90 backdrop-blur-md">
        <Link href="/" className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main transition-colors active:scale-95">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex bg-surface-muted p-1 rounded-full border border-border/60">
          {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategoryId("");
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all duration-200 capitalize ${
                type === t
                  ? "bg-[#083328] text-white shadow-sm"
                  : "text-text-secondary hover:text-text-main"
              }`}
            >
              {t === "expense" ? "Pengeluaran" : t === "income" ? "Pemasukan" : "Transfer"}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 p-5 space-y-5">
        <form id="tx-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Card */}
          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2">
            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Nominal Transaksi
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
                className="w-full p-4 pl-12 bg-surface-muted border border-border/80 rounded-2xl outline-none text-2xl font-bold text-text-main focus:ring-2 focus:ring-[#A3F03A]"
              />
            </div>
          </div>

          {/* Wallets & Category Card */}
          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                  {type === 'transfer' ? 'Dari Dompet' : 'Dompet'}
                </label>
                <select
                  required
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full p-3.5 bg-surface-muted border border-border/80 rounded-2xl outline-none text-[13px] font-semibold text-text-main appearance-none cursor-pointer"
                >
                  <option value="" disabled>Pilih Dompet</option>
                  {wallets?.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              {type === 'transfer' && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                    Ke Dompet
                  </label>
                  <select
                    required
                    value={toWalletId}
                    onChange={(e) => setToWalletId(e.target.value)}
                    className="w-full p-3.5 bg-surface-muted border border-border/80 rounded-2xl outline-none text-[13px] font-semibold text-text-main appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Pilih Tujuan</option>
                    {wallets?.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {type !== 'transfer' && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                    Kategori
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-3.5 bg-surface-muted border border-border/80 rounded-2xl outline-none text-[13px] font-semibold text-text-main appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    {categories?.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Date picker */}
            <div className="space-y-1.5 relative">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                Tanggal Transaksi
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full p-3.5 bg-surface-muted border border-border/80 rounded-2xl outline-none text-left flex justify-between items-center text-[13px] font-semibold text-text-main active:scale-[0.99] transition-transform"
                >
                  <span>{format(date, "d MMMM yyyy", { locale: localeID })}</span>
                  <CalendarIcon size={18} className="text-text-secondary" />
                </button>

                {showDatePicker && (
                  <div className="absolute z-[100] mt-2 bg-surface border border-border/80 rounded-3xl shadow-xl p-4 right-0 left-0 flex flex-col items-center">
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
                    <div className="mt-3 flex justify-end w-full border-t border-border/60 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(false)}
                        className="bg-[#083328] text-[#A3F03A] px-4 py-1.5 rounded-full font-bold text-xs hover:opacity-90 active:scale-95 transition-all"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Makan siang, bensin, gaji..."
                className="w-full p-3.5 bg-surface-muted border border-border/80 rounded-2xl outline-none text-[13px] font-semibold text-text-main focus:ring-2 focus:ring-[#A3F03A]"
              />
            </div>
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-3">
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete Transaction"
            className="col-span-1 flex items-center justify-center py-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-full hover:bg-red-100 transition-all active:scale-95"
          >
            <Trash2 size={20} />
          </button>
          <button
            type="submit"
            form="tx-form"
            disabled={!amount || !walletId}
            className="col-span-3 w-full py-3.5 bg-[#A3F03A] text-[#083328] rounded-full font-bold text-[15px] shadow-[0_4px_14px_rgba(163,240,58,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
