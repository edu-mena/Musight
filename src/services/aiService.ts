import type { Comment } from "../data/debates";
import type { Article } from "../data/articles";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";

function buildSystemPrompt(userName?: string): string {
  const greeting = userName
    ? `O utilizador chama-se ${userName.split(" ")[0]}. Dirige-te a ele pelo primeiro nome de forma natural e calorosa, mas sem exagerar.`
    : "Não sabes o nome do utilizador. Trata-o de forma amigável e genérica.";

  return `Chamas-te Weza, a assistente jornalística inteligente da Rede Girassol — o jornal digital de referência em Angola.
A tua missão é ajudar cidadãos angolanos a compreender melhor as notícias, os debates públicos e os temas do país, de forma clara, equilibrada e acessível.

${greeting}

Ao responder:
- Apresenta-te como Weza quando fizer sentido, mas não de forma repetitiva
- Usa sempre português (variante angolana/europeia), com um tom informativo e próximo
- Sê factual e equilibrada — apresenta diferentes perspectivas sem tomar partido
- Quando analisas debates, identifica os argumentos mais sólidos de cada lado e aponta consensos e divergências
- Contextualiza sempre com a realidade angolana quando relevante
- Sê concisa: 2 a 5 parágrafos no máximo, salvo pedido explícito de detalhe
- Nunca inventas factos; se não tiveres certeza, diz-o claramente
- Evita jargões técnicos desnecessários; se os usas, explica-os brevemente`;
}

interface GroqResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

async function callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("Chave da API não configurada. Adiciona VITE_GROQ_API_KEY ao ficheiro .env.local.");
  }

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const data = await res.json() as GroqResponse;

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `Erro ${res.status} — tenta novamente mais tarde.`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("A Weza não conseguiu gerar uma resposta. Tenta novamente.");
  return text;
}

// ── Debates ──────────────────────────────────────────────────────────────────

export interface DebateContext {
  title: string;
  summary: string;
  comments: Comment[];
}

const SIDE_LABELS: Record<Comment["side"], string> = {
  favor: "A Favor",
  contra: "Contra",
  neutro: "Neutro",
};

export async function analyzeDebate(
  { title, summary, comments }: DebateContext,
  userName?: string
): Promise<string> {
  const commentLines = comments
    .map(
      (c) =>
        `[${SIDE_LABELS[c.side]}] ${c.author}${c.isExpert ? " (Especialista)" : ""}: "${c.text}"`
    )
    .join("\n\n");

  const prompt = `Analisa o seguinte debate público:

**Tema:** ${title}
**Contexto:** ${summary}

**Contribuições dos participantes:**
${commentLines}

Faz uma análise equilibrada: resume os principais argumentos de cada lado, identifica pontos de consenso e de discordância, e fornece contexto factual sobre o tema em Angola.`;

  return callGroq(buildSystemPrompt(userName), prompt);
}

export async function analyzeComment(
  { title, summary, comments }: DebateContext,
  comment: Comment,
  userName?: string
): Promise<string> {
  const others = comments
    .filter((c) => c.id !== comment.id)
    .map((c) => `[${SIDE_LABELS[c.side]}] ${c.author}: "${c.text}"`)
    .join("\n");

  const prompt = `No contexto do debate "${title}" (${summary}), analisa a seguinte contribuição:

**Contribuição em análise:**
[${SIDE_LABELS[comment.side]}] ${comment.author}${comment.isExpert ? " (Especialista)" : ""} — ${comment.role}:
"${comment.text}"

**Outras contribuições no debate:**
${others || "Sem outras contribuições ainda."}

Avalia este argumento: pontos fortes, eventuais lacunas, e como se enquadra no debate mais amplo. Complementa com contexto factual angolano relevante.`;

  return callGroq(buildSystemPrompt(userName), prompt);
}

// ── Artigos ──────────────────────────────────────────────────────────────────

export async function askAboutArticle(
  article: Article,
  question: string,
  userName?: string
): Promise<string> {
  const levels = article.levels
    .map((l) => `[${l.label}] ${l.text}`)
    .join("\n\n");
  const terms = article.keyTerms
    .map((kt) => `${kt.term}: ${kt.definition}`)
    .join("\n");

  const prompt = `Responde à seguinte questão sobre o artigo abaixo.

**Artigo:** ${article.title} (${article.category}, ${article.date})

**Conteúdo do artigo (três níveis de explicação):**
${levels}

**Glossário de termos relevantes:**
${terms}

**Pergunta do leitor:**
${question}

Responde de forma clara e factual. Adapta o nível de detalhe à pergunta feita.`;

  return callGroq(buildSystemPrompt(userName), prompt);
}
