"use client";

import { useState } from "react";
import { Sparkles, X, ArrowRight, Check, Loader2 } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { walletService } from "@/lib/services/walletService";
import { categoryService } from "@/lib/services/categoryService";
import { transactionService } from "@/lib/services/transactionService";
import { aiService, type ParsedTransactionResult } from "@/lib/services/aiService";
import { formatAiInline } from "@/components/FormattedAiText";
import { useRouter } from "next/navigation";

interface AiQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AiQuickAddModal({ isOpen, onClose, onSuccess }: AiQuickAddModalProps) {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedTransactionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const wallets = useLiveQuery(() => walletService.getAllActive());
  const categories = useLiveQuery(() => categoryService.getAllActive());

  if (!isOpen) return null;

  const quickSamples = [
    "Makan siang sate ayam 35rb bayar pakai BCA",
    "Beli bensin pertalite 30rb tunai",
    "Terima transfer freelance 500rb di Mandiri",
  ];

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || inputText;
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setParsedResult(null);

    try {
      const activeWallets = wallets?.map((w) => ({ id: w.id, name: w.name })) || [];
      const activeCategories = categories?.map((c) => ({ id: c.id, name: c.name, type: c.type })) || [];

      const result = await aiService.parseNaturalTransaction(text, activeWallets, activeCategories);
      setParsedResult(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memproses kalimat dengan AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDirectly = async () => {
    if (!parsedResult) return;
    setIsSaving(true);
    setError(null);

    try {
      // Fallback wallet if none matched
      let chosenWalletId = parsedResult.walletId;
      if (!chosenWalletId && wallets && wallets.length > 0) {
        chosenWalletId = wallets[0].id;
      }

      // Fallback category if none matched
      let chosenCategoryId = parsedResult.categoryId;
      if (!chosenCategoryId && categories && categories.length > 0) {
        const matchType = categories.find((c) => c.type === parsedResult.type);
        chosenCategoryId = matchType ? matchType.id : categories[0].id;
      }

      await transactionService.create({
        type: parsedResult.type,
        amount: parsedResult.amount,
        walletId: chosenWalletId,
        toWalletId: parsedResult.toWalletId,
        categoryId: parsedResult.type !== "transfer" ? chosenCategoryId : undefined,
        date: parsedResult.date ? new Date(parsedResult.date) : new Date(),
        note: parsedResult.note || "Transaksi AI",
      });

      setIsSaving(false);
      setInputText("");
      setParsedResult(null);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal menyimpan transaksi.");
      setIsSaving(false);
    }
  };

  const handleOpenInForm = () => {
    if (!parsedResult) return;
    const params = new URLSearchParams({
      type: parsedResult.type,
      amount: String(parsedResult.amount || ""),
      walletId: parsedResult.walletId || "",
      categoryId: parsedResult.categoryId || "",
      note: parsedResult.note || "",
    });
    onClose();
    router.push(`/transactions/new?${params.toString()}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const matchedWallet = wallets?.find((w) => w.id === parsedResult?.walletId);
  const matchedCategory = categories?.find((c) => c.id === parsedResult?.categoryId);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bubble-card w-full max-w-md p-6 relative overflow-hidden animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#A3F03A]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#083328] to-[#14533F] text-[#A3F03A] flex items-center justify-center shadow-sm">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-main tracking-tight flex items-center gap-1.5">
                <span>Catat Cepat via AI</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#083328]/10 dark:bg-white/10 text-[#083328] dark:text-[#A3F03A] liquid-glass-pill">
                  Flash
                </span>
              </h2>
              <p className="text-[11px] text-text-secondary">Tulis transaksi dengan bahasa santai sehari-hari</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full liquid-glass-pill flex items-center justify-center text-text-secondary hover:text-text-main press-spring"
          >
            <X size={16} />
          </button>
        </div>

        {/* Input box */}
        <div className="relative z-10 space-y-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleParse();
              }
            }}
            placeholder="Contoh: Tadi beli makan siang 35 ribu bayar pakai BCA..."
            rows={3}
            className="w-full p-3.5 bg-surface-muted border border-border/80 rounded-2xl outline-none text-sm text-text-main placeholder:text-text-secondary/60 focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth resize-none"
          />

          {/* Quick sample chips */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-text-secondary">Contoh Cepat:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickSamples.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(sample);
                    handleParse(sample);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full liquid-glass-pill text-text-secondary hover:text-text-main press-spring text-left"
                >
                  &ldquo;{sample}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Process button */}
        <div className="relative z-10">
          <button
            type="button"
            onClick={() => handleParse()}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-3 bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] rounded-full font-bold text-sm shadow-lime-glow hover:shadow-lime-glow-lg disabled:opacity-50 disabled:cursor-not-allowed press-spring flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>AI sedang menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Ekstrak dengan AI</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs leading-relaxed">
            {error}
          </div>
        )}

        {/* Parsed Result Card */}
        {parsedResult && (
          <div className="p-4 rounded-[24px] bubble-item space-y-3 animate-fade-in relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Hasil Ekstraksi AI
                </span>
                <p className="text-xl font-extrabold text-text-main tracking-tight mt-0.5">
                  {formatCurrency(parsedResult.amount)}
                </p>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${
                parsedResult.type === "income"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : parsedResult.type === "expense"
                  ? "bg-red-500/15 text-red-500 dark:text-red-400"
                  : "bg-blue-500/15 text-blue-500"
              }`}>
                {parsedResult.type === "expense" ? "Pengeluaran" : parsedResult.type === "income" ? "Pemasukan" : "Transfer"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-black/5 dark:border-white/5">
              <div>
                <span className="text-text-secondary text-[11px] block">Dompet:</span>
                <span className="font-semibold text-text-main">
                  {matchedWallet?.name || "Otomatis (Default)"}
                </span>
              </div>
              <div>
                <span className="text-text-secondary text-[11px] block">Kategori:</span>
                <span className="font-semibold text-text-main">
                  {matchedCategory?.name || "Lainnya"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-text-secondary text-[11px] block">Catatan:</span>
                <span className="font-semibold text-text-main">
                  {parsedResult.note || "-"}
                </span>
              </div>
            </div>

            {parsedResult.explanation && (
              <p className="text-[11px] text-text-secondary bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                💡 {formatAiInline(parsedResult.explanation)}
              </p>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenInForm}
                className="py-2.5 px-3 rounded-full liquid-glass-pill text-text-main font-semibold text-xs flex items-center justify-center gap-1.5 press-spring"
              >
                <span>Edit di Form</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={handleSaveDirectly}
                disabled={isSaving}
                className="py-2.5 px-3 rounded-full bg-[#083328] dark:bg-[#A3F03A] text-white dark:text-[#083328] font-bold text-xs flex items-center justify-center gap-1.5 press-spring shadow-sm"
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} strokeWidth={2.5} />
                )}
                <span>Simpan Sekarang</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

