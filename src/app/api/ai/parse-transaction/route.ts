import { NextResponse } from "next/server";
import { callAI } from "@/lib/server/aiClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, wallets = [], categories = [] } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Teks transaksi tidak boleh kosong." },
        { status: 400 }
      );
    }

    const todayStr = new Date().toISOString();

    const systemPrompt = `Anda adalah asisten cerdas pencatat transaksi keuangan pribadi berbahasa Indonesia.
Tugas Anda adalah mengekstrak informasi transaksi dari kalimat bahasa alami yang ditulis pengguna dan mengembalikan HASIL HANYA DALAM FORMAT JSON VALID.

Daftar Dompet yang Tersedia:
${JSON.stringify(wallets.map((w: any) => ({ id: w.id, name: w.name })))}

Daftar Kategori yang Tersedia:
${JSON.stringify(categories.map((c: any) => ({ id: c.id, name: c.name, type: c.type })))}

Tanggal & Waktu Saat Ini: ${todayStr}

Pedoman Ekstraksi:
1. "type": tentukan apakah "expense" (pengeluaran), "income" (pemasukan), atau "transfer" (transfer antar dompet).
2. "amount": nominal angka bulat (misal: "35 ribu" atau "35k" -> 35000, "1,5 juta" -> 1500000). Jika tidak ada angka, beri 0.
3. "walletId": ID dompet yang paling cocok dari daftar dompet di atas. Jika tidak ada yang cocok, gunakan ID dompet pertama atau kosongkan ("").
4. "toWalletId": jika tipe transfer, ID dompet tujuan.
5. "categoryId": ID kategori yang paling cocok dari daftar kategori di atas sesuai dengan tipe transaksi.
6. "note": ringkasan singkat transaksi (contoh: "Makan sate ayam", "Beli bensin pertalite", "Gaji bulanan").
7. "date": tanggal transaksi dalam format ISO string (contoh: "${todayStr}"). Jika pengguna menyebut "kemarin", kurangi 1 hari.
8. "explanation": penjelasan singkat 1 kalimat dalam bahasa Indonesia mengenai apa yang berhasil diekstrak.

FORMAT OUTPUT WAJIB:
Hanya kembalikan string JSON murni tanpa markdown, tanpa awalan atau akhiran teks lain:
{
  "type": "expense",
  "amount": 35000,
  "walletId": "...",
  "toWalletId": "",
  "categoryId": "...",
  "note": "Makan sate ayam",
  "date": "${todayStr}",
  "explanation": "Pengeluaran Rp35.000 untuk makan sate ayam via BCA"
}`;

    const rawResponse = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.1,
      req,
    });

    // Clean any markdown code blocks (e.g. ```json ... ```)
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }

    const parsedData = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("Parse transaction error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses transaksi dengan AI." },
      { status: 500 }
    );
  }
}

