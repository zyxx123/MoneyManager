import { NextResponse } from "next/server";
import { callAI } from "@/lib/server/aiClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      month = "Bulan Ini",
      totalIncome = 0,
      totalExpense = 0,
      categoryBreakdown = [],
      savingsGoals = [],
      budgetSummary = {},
    } = body;

    const netSurplus = totalIncome - totalExpense;
    const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;

    const dataContext = {
      month,
      totalIncome,
      totalExpense,
      netSurplus,
      expenseRatio: `${expenseRatio.toFixed(1)}%`,
      topCategories: categoryBreakdown.slice(0, 5),
      savingsGoals,
      budgetSummary,
    };

    const systemPrompt = `Anda adalah analis kesehatan keuangan pribadi senior.
Tugas Anda adalah menganalisis laporan keuangan bulanan pengguna secara objektif, mendalam, dan memberikan skor kesehatan keuangan beserta rekomendasi strategis.

Data Laporan Keuangan:
\`\`\`json
${JSON.stringify(dataContext, null, 2)}
\`\`\`

Kriteria Penilaian Skor (0-100):
- 85-100: Sangat Sehat (Surplus tinggi > 30% pendapatan, pengeluaran terkendali, ada alokasi tabungan).
- 70-84: Sehat (Surplus 10-30%, pengeluaran wajar).
- 50-69: Cukup Sehat (Break even atau surplus tipis < 10%).
- 30-49: Perlu Waspada (Defisit ringan atau pengeluaran > 90% pemasukan).
- 0-29: Kritis (Defisit berat atau pengeluaran jauh melampaui pemasukan).

FORMAT OUTPUT WAJIB:
Hanya kembalikan string JSON murni tanpa markdown, tanpa teks pembuka/penutup:
{
  "healthScore": 85,
  "status": "Sangat Sehat",
  "summary": "Ringkasan analisis keuangan 2-3 kalimat...",
  "strengths": [
    "Poin kebiasaan baik 1...",
    "Poin kebiasaan baik 2..."
  ],
  "concerns": [
    "Hal yang perlu diwaspadai 1..."
  ],
  "recommendations": [
    "Langkah perbaikan nyata 1...",
    "Langkah perbaikan nyata 2..."
  ]
}`;

    const rawResponse = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analisis laporan keuangan untuk periode ${month}.` },
      ],
      temperature: 0.2,
      req,
    });

    let cleaned = rawResponse.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }

    const report = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("AI Analyze Report error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menganalisis laporan dengan AI." },
      { status: 500 }
    );
  }
}

