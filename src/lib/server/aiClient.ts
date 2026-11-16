export interface AICallParams {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  req?: Request;
}

export function getAIConfig(req?: Request) {
  const headerKey = req?.headers.get("x-ai-api-key")?.trim();
  const envKey = process.env.AI_API_KEY?.trim();
  
  const apiKey = headerKey || envKey || "";
  const baseUrl = (process.env.AI_BASE_URL?.trim() || "https://chat.jenderalpanel.com/v1").replace(/\/+$/, "");
  const model = process.env.AI_MODEL?.trim() || "irham-model-flash";

  return { apiKey, baseUrl, model };
}

export async function callAI({ messages, temperature = 0.5, req }: AICallParams) {
  const { apiKey, baseUrl, model } = getAIConfig(req);

  if (!apiKey) {
    throw new Error(
      "API Key belum disetel! Harap masukkan API Key Anda di menu Pengaturan Aplikasi atau setel variabel AI_API_KEY di Vercel."
    );
  }

  const endpoint = `${baseUrl}/chat/completions`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMsg = `Server AI merespons dengan status ${res.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error?.message || errorJson.message || errorMsg;
      } catch {
        if (errorText) errorMsg += `: ${errorText.slice(0, 150)}`;
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Tidak ada balasan yang diterima dari model AI.");
    }

    return content as string;
  } catch (error: any) {
    console.error("AI API Call Error:", error);
    throw error;
  }
}

