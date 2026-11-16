export interface ParsedTransactionResult {
  type: "expense" | "income" | "transfer";
  amount: number;
  walletId: string;
  toWalletId?: string;
  categoryId: string;
  note: string;
  date: string;
  explanation: string;
}

export interface MonthlyHealthAnalysis {
  healthScore: number;
  status: "Sangat Sehat" | "Sehat" | "Cukup Sehat" | "Perlu Waspada" | "Kritis";
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export const aiService = {
  getCustomApiKey(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("pundi_ai_api_key") || "";
  },

  setCustomApiKey(key: string) {
    if (typeof window === "undefined") return;
    if (!key.trim()) {
      localStorage.removeItem("pundi_ai_api_key");
    } else {
      localStorage.setItem("pundi_ai_api_key", key.trim());
    }
  },

  getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const customKey = this.getCustomApiKey();
    if (customKey) {
      headers["x-ai-api-key"] = customKey;
    }
    return headers;
  },

  async parseNaturalTransaction(
    text: string,
    wallets: Array<{ id: string; name: string }>,
    categories: Array<{ id: string; name: string; type: string }>
  ): Promise<ParsedTransactionResult> {
    const res = await fetch("/api/ai/parse-transaction", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ text, wallets, categories }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal memproses transaksi dengan AI");
    }

    return data.data;
  },

  async askAdvisor(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    financialContext: any
  ): Promise<string> {
    const res = await fetch("/api/ai/advisor", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ messages, financialContext }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal menghubungi AI Advisor");
    }

    return data.reply;
  },

  async analyzeMonthlyReport(params: {
    month: string;
    totalIncome: number;
    totalExpense: number;
    categoryBreakdown: any[];
    savingsGoals?: any[];
    budgetSummary?: any;
  }): Promise<MonthlyHealthAnalysis> {
    const res = await fetch("/api/ai/analyze-report", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal menganalisis laporan");
    }

    return data.data;
  },
};

