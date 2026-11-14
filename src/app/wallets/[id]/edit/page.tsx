"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { walletService } from "@/lib/services/walletService";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
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

export default function EditWalletPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [type, setType] = useState<Wallet["type"]>("bank");
  const [color, setColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchWallet = async () => {
      try {
        const wallet = await walletService.getById(id);
        if (!wallet) {
          alert("Dompet tidak ditemukan");
          router.push("/wallets");
          return;
        }
        setName(wallet.name);
        setType(wallet.type);
        setColor(wallet.color);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    fetchWallet();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await walletService.update(id, {
        name,
        type,
        color,
      });
      router.push("/wallets");
    } catch (error) {
      console.error("Failed to update wallet:", error);
      alert("Gagal mengupdate dompet");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus dompet ini? Jika ada transaksi yang terkait, ini mungkin gagal atau harus diarsipkan.")) return;
    try {
      await walletService.delete(id);
      router.push("/wallets");
    } catch (error: any) {
      console.error("Failed to delete wallet:", error);
      alert(error.message || "Gagal menghapus dompet");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-xs text-text-secondary">Memuat dompet...</div>;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/90 backdrop-blur-md">
        <div className="flex items-center">
          <Link href="/wallets" className="w-10 h-10 rounded-full bg-surface border border-border/80 flex items-center justify-center text-text-secondary hover:text-text-main transition-colors active:scale-95">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-bold ml-3 tracking-tight">Edit Dompet</h1>
        </div>
      </header>

      <div className="flex-1 p-5">
        <form id="wallet-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-2">
            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Nama Dompet
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Utama, Uang Makan"
              className="w-full p-4 bg-surface-muted border border-border/80 rounded-2xl outline-none text-[15px] font-semibold text-text-main focus:ring-2 focus:ring-[#A3F03A]"
            />
          </div>

          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Tipe Dompet
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WALLET_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as any)}
                  className={`p-3 text-[13px] font-bold rounded-2xl text-center transition-all duration-200 ${
                    type === t.value
                      ? "bg-[#083328] text-white shadow-md"
                      : "bg-surface-muted text-text-secondary hover:bg-black/5"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-5 border border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Warna Dompet
            </label>
            <div className="flex gap-3 flex-wrap justify-center pt-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${color === c ? 'scale-110 shadow-md ring-2 ring-[#083328] dark:ring-[#A3F03A]' : 'hover:scale-105 opacity-80'}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={18} className="text-white drop-shadow-md" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-3">
          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete Wallet"
            className="col-span-1 flex items-center justify-center py-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-full hover:bg-red-100 transition-all active:scale-95"
          >
            <Trash2 size={20} />
          </button>
          <button
            type="submit"
            form="wallet-form"
            disabled={!name}
            className="col-span-3 w-full py-3.5 bg-[#A3F03A] text-[#083328] rounded-full font-bold text-[15px] shadow-[0_4px_14px_rgba(163,240,58,0.4)] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
