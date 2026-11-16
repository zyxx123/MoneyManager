"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Sparkles, Send, Loader2, Bot, User, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { walletService } from "@/lib/services/walletService";
import { budgetService } from "@/lib/services/budgetService";
import { savingsService } from "@/lib/services/savingsService";
import { transactionService } from "@/lib/services/transactionService";
import { aiService } from "@/lib/services/aiService";
import { FormattedAiText } from "@/components/FormattedAiText";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const wallets = useLiveQuery(() => walletService.getAllActive());
  const activeBudget = useLiveQuery(() => budgetService.getActiveBudget());
  const savings = useLiveQuery(() => savingsService.getAllActive());
  const transactions = useLiveQuery(() => transactionService.getAll());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBalance = wallets
    ?.filter((w) => w.type !== "savings")
    .reduce((sum, w) => sum + w.cachedBalance, 0) ?? 0;

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Halo! Saya **Pundi AI**, konsultan keuangan pribadi Anda. 🌿\n\nSaya telah memantau kondisi saldo dan alokasi budget Anda. Anda bisa bertanya apa saja, seperti:\n* *"Apakah pengeluaran jajan saya minggu ini aman?"*\n* *"Beri saya tips menghemat untuk mencapai target tabungan"*\n* *"Bagaimana alokasi ideal untuk sisa saldo saya?"*\n\nAda yang bisa saya bantu hari ini?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const quickPrompts = [
    "Apakah pengeluaran jajan saya minggu ini aman?",
    "Beri saya tips menghemat untuk target tabungan",
    "Evaluasi keuangan dan kebiasaan belanja saya",
    "Berapa idealnya jatah jajan harian saya?",
  ];

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!customPrompt) setInputText("");
    setIsLoading(true);

    try {
      // Build live financial context
      let budgetInfo = null;
      const stats = await budgetService.getDailyLimitStatus();
      if (stats) {
        budgetInfo = {
          name: activeBudget?.name || "Budget Aktif",
          budgetAmount: stats.budgetAmount,
          remainingBudget: stats.remainingBudget,
          dailyLimit: stats.dailyLimit,
          todayExpenses: stats.todayExpenses,
          remainingDailyBudget: stats.remainingDailyBudget,
        };
      }

      const financialContext = {
        totalBalance,
        wallets: wallets?.map((w) => ({ name: w.name, balance: w.cachedBalance, type: w.type })) || [],
        budget: budgetInfo,
        savingsGoals: savings?.map((s) => ({ name: s.name, target: s.targetAmount, current: s.currentAmount })) || [],
        recentTransactionsCount: transactions?.length || 0,
      };

      const reply = await aiService.askAdvisor(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        financialContext
      );

      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `⚠️ **Maaf, terjadi kendala saat memproses jawaban.**\n\n${err.message || "Pastikan API Key sudah disetel di menu Pengaturan atau file konfigurasi."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (confirm("Mulai sesi obrolan baru?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24 animate-fade-in-up">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-background/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <Link
            href="/more"
            className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-text-secondary hover:text-text-main press-spring"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#083328] to-[#14533F] text-[#A3F03A] flex items-center justify-center shadow-lime-glow-sm">
              <Sparkles size={18} />
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight flex items-center gap-1.5 leading-snug">
                <span>Pundi AI Advisor</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] text-text-secondary font-medium">Model: Flash Online</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          title="Reset Percakapan"
          className="w-9 h-9 rounded-full liquid-glass-pill flex items-center justify-center text-text-secondary hover:text-text-main press-spring"
        >
          <RefreshCw size={15} />
        </button>
      </header>

      {/* Financial Context Pill Bar */}
      <div className="px-4 py-2">
        <div className="bubble-item p-3 rounded-[20px] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary">Saldo Terhubung:</span>
            <span className="font-bold text-text-main">{formatCurrency(totalBalance)}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#083328]/10 dark:bg-white/10 text-[#083328] dark:text-[#A3F03A] liquid-glass-pill">
            Live Context
          </span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-[#083328] text-[#A3F03A] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[84%] p-4 rounded-[26px] text-sm leading-relaxed ${
                  isUser
                    ? "bg-gradient-to-r from-[#083328] to-[#0D4436] text-white shadow-sm rounded-tr-sm"
                    : "bubble-card rounded-tl-sm text-text-main space-y-2"
                }`}
              >
                {/* Formatted AI / User Message */}
                <FormattedAiText content={m.content} isUser={isUser} />
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? "text-white/60" : "text-text-secondary/60"
                  }`}
                >
                  {new Date(m.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-surface-muted text-text-secondary flex items-center justify-center shrink-0 mt-1">
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-[#083328] text-[#A3F03A] flex items-center justify-center shrink-0 mt-1 shadow-sm">
              <Bot size={16} />
            </div>
            <div className="bubble-card p-4 rounded-[26px] rounded-tl-sm flex items-center gap-2 text-text-secondary text-xs">
              <Loader2 size={16} className="animate-spin text-[#083328] dark:text-[#A3F03A]" />
              <span>Pundi AI sedang berpikir...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts (visible when few messages) */}
      {messages.length <= 3 && !isLoading && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="text-xs px-3.5 py-1.5 rounded-full liquid-glass-pill text-text-secondary hover:text-text-main press-spring whitespace-nowrap shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/80 backdrop-blur-xl border-t border-black/5 dark:border-white/5 z-30">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Tanyakan sesuatu ke Pundi AI..."
            className="flex-1 py-3 px-4.5 bg-surface-muted border border-border/80 rounded-full outline-none text-sm text-text-main placeholder:text-text-secondary/60 focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#A3F03A] to-[#B6FF4D] text-[#083328] flex items-center justify-center shadow-lime-glow hover:shadow-lime-glow-lg disabled:opacity-50 disabled:cursor-not-allowed press-spring shrink-0"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

