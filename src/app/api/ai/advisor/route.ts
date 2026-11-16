import { NextResponse } from "next/server";
import { callAI } from "@/lib/server/aiClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [], financialContext = {} } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Pesan percakapan tidak boleh kosong." },
        { status: 400 }
      );
    }

    const contextStr = JSON.stringify(financialContext, null, 2);

    const systemPrompt = `Anda adalah "Pundi AI", seorang perencana keuangan dan konsultan finansial pribadi yang ramah, solutif, empatik, dan cerdas.
Gaya komunikasi Anda:
- Menggunakan bahasa Indonesia yang santai, sopan, bersahabat, dan memotivasi.
- Selalu memberikan wawasan berdasarkan data keuangan aktual pengguna jika tersedia.
- Berikan saran konkret yang realistis (misal: aturan 50/30/20, mengendalikan jajan harian, alokasi tabungan).
- Gunakan poin-poin singkat (bullet points dengan strip '-') dan emoji yang relevan agar nyaman dibaca di layar ponsel.
- Format teks dengan rapi, bersih, dan natural. Hindari penggunaan tanda bintang (**) yang berlebihan atau kaku pada setiap kalimat.

Konteks Data Keuangan Pengguna Saat Ini:
\`\`\`json
${contextStr}
\`\`\`

Panduan Jawaban:
1. Jika pengguna menanyakan apakah pengeluaran hari ini atau minggu ini aman, rujuk ke jatah jajan harian ("dailyLimit"), sisa budget hari ini ("remainingDailyBudget"), atau sisa budget periode saat ini.
2. Jika pengguna menanyakan tips tabungan, berikan strategi spesifik untuk mencapai target tabungan ("savingsGoals") mereka.
3. Selalu beri dorongan positif agar pengguna merasa didampingi dalam mengelola uangnya.`;

    const formattedMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.slice(-10).map((m: any) => ({
        role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: String(m.content),
      })),
    ];

    const reply = await callAI({
      messages: formattedMessages,
      temperature: 0.7,
      req,
    });

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error("AI Advisor error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghubungi AI Advisor." },
      { status: 500 }
    );
  }
}

