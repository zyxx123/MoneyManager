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
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", 
  "#8b5cf6", "#ec4899", "#14b8a6", "#64748b"
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

  if (isLoading) return <div className="p-8 text-center">Memuat...</div>;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-[100px]">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/90 backdrop-blur-md">
        <div className="flex items-center">
          <Link href="/wallets" className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-none transition-colors active:translate-y-1.5 active:translate-x-1.5 active:shadow-none">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-[20px] font-semibold ml-2">Edit Dompet</h1>
        </div>
      </header>

      <div className="flex-1 p-5">
        <form id="wallet-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Nama Dompet
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA Utama, Uang Makan"
              className="w-full p-4 bg-surface border-[3px] border-black rounded-none focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Tipe Dompet
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WALLET_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as any)}
                  className={`p-3 text-[13px] font-semibold rounded-[14px] text-center transition-all duration-200 ${
                    type === t.value
                      ? "bg-primary-soft text-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border border-primary/20"
                      : "bg-surface border-[3px] border-black text-text-secondary hover:text-text-main"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
              Warna
            </label>
            <div className="flex gap-4 flex-wrap bg-surface p-4 border-[3px] border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] justify-center">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-11 h-11 rounded-none flex items-center justify-center transition-all duration-200 ${color === c ? 'scale-110 shadow-lg ring-2 ring-primary ring-offset-2 dark:ring-offset-background' : 'hover:scale-105 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check size={22} className="text-white drop-shadow-md" strokeWidth={3} />}
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
            className="col-span-1 flex items-center justify-center py-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-none hover:bg-red-100 dark:hover:bg-red-900/40 active:translate-y-1.5 active:translate-x-1.5 active:shadow-none transition-all duration-200"
          >
            <Trash2 size={24} />
          </button>
          <button
            type="submit"
            form="wallet-form"
            disabled={!name}
            className="col-span-3 w-full py-4 bg-primary text-white rounded-none font-semibold text-[16px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-1.5 active:translate-x-1.5 active:shadow-none transition-all duration-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-[3px] border-black"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
