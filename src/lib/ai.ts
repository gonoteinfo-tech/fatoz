import { AppSettings, AiProvider } from "./settings";

export interface RewriteInput {
  title: string;
  content: string;
  sourceUrl?: string;
  category?: string;
}

export interface RewriteResult {
  title: string;
  excerpt: string;
  content: string; // HTML
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  tags: string;
  category: string;
  provider: AiProvider;
}

function buildPrompt(input: RewriteInput, s: AppSettings): string {
  return `Você é um redator jornalístico profissional. Reescreva a notícia abaixo de forma TOTALMENTE ORIGINAL, em ${s.rewriteLanguage}, com tom ${s.rewriteTone}.

Regras importantes:
- NÃO copie frases do original. Reescreva com suas próprias palavras, mantendo todos os fatos corretos.
- Estruture em parágrafos claros usando HTML simples (<p>, <h2>, <ul>, <li>, <strong>). Não use <html>, <head> ou <body>.
- O texto deve ser otimizado para SEO, com 400 a 800 palavras quando houver conteúdo suficiente.
- Crie um título atraente e original (não clickbait enganoso).
${s.rewriteInstructions ? `- Instruções extras do editor: ${s.rewriteInstructions}` : ""}

Responda APENAS com um objeto JSON válido (sem markdown, sem cercas de código) neste formato exato:
{
  "title": "título reescrito",
  "excerpt": "resumo de 1-2 frases (max 200 caracteres)",
  "content": "corpo da notícia em HTML",
  "metaTitle": "título SEO (max 60 caracteres)",
  "metaDescription": "meta description SEO (max 155 caracteres)",
  "keywords": "palavra1, palavra2, palavra3",
  "tags": "tag1, tag2, tag3",
  "category": "categoria sugerida"
}

NOTÍCIA ORIGINAL:
Título: ${input.title}
Categoria sugerida: ${input.category || "Geral"}
Conteúdo: ${input.content.slice(0, 8000)}`;
}

function extractJson(text: string): any {
  let t = text.trim();
  // remove cercas de markdown se existirem
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

async function callClaude(prompt: string, s: AppSettings): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": s.claudeApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: s.claudeModel || "claude-opus-4-8",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

async function callGemini(prompt: string, s: AppSettings): Promise<string> {
  const model = s.geminiModel || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${s.geminiApiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 4000 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callOpenAI(prompt: string, s: AppSettings): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${s.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: s.openaiModel || "gpt-4o-mini",
      temperature: 0.8,
      messages: [
        { role: "system", content: "Você responde apenas com JSON válido." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function rewriteArticle(input: RewriteInput, s: AppSettings): Promise<RewriteResult> {
  const prompt = buildPrompt(input, s);
  let raw = "";

  if (s.aiProvider === "claude") {
    if (!s.claudeApiKey) throw new Error("Chave da API Claude não configurada.");
    raw = await callClaude(prompt, s);
  } else if (s.aiProvider === "openai") {
    if (!s.openaiApiKey) throw new Error("Chave da API OpenAI não configurada.");
    raw = await callOpenAI(prompt, s);
  } else {
    if (!s.geminiApiKey) throw new Error("Chave da API Gemini não configurada.");
    raw = await callGemini(prompt, s);
  }

  const parsed = extractJson(raw);
  return {
    title: String(parsed.title || input.title).trim(),
    excerpt: String(parsed.excerpt || "").trim(),
    content: String(parsed.content || "").trim(),
    metaTitle: String(parsed.metaTitle || parsed.title || "").slice(0, 70).trim(),
    metaDescription: String(parsed.metaDescription || parsed.excerpt || "").slice(0, 170).trim(),
    keywords: String(parsed.keywords || "").trim(),
    tags: String(parsed.tags || "").trim(),
    category: String(parsed.category || input.category || "Geral").trim(),
    provider: s.aiProvider,
  };
}

// Testa a conexão com o provedor de IA selecionado
export async function testProvider(s: AppSettings): Promise<{ ok: boolean; message: string }> {
  try {
    const prompt = 'Responda apenas com JSON: {"title":"ok","excerpt":"ok","content":"<p>ok</p>","metaTitle":"ok","metaDescription":"ok","keywords":"ok","tags":"ok","category":"Teste"}';
    if (s.aiProvider === "claude") await callClaude(prompt, s);
    else if (s.aiProvider === "openai") await callOpenAI(prompt, s);
    else await callGemini(prompt, s);
    return { ok: true, message: `Conexão com ${s.aiProvider} bem-sucedida.` };
  } catch (e: any) {
    return { ok: false, message: e.message || "Falha na conexão." };
  }
}
