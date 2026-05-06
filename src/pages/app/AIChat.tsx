import { useState, useRef, useEffect } from "react";
import { Bot, Send, User } from "lucide-react";

interface Message { id: string; role: "user" | "ai"; text: string; }

const SUGGESTIONS = [
  "O que é a taxa BNA e como me afecta?",
  "Explica-me a cólera de forma simples",
  "Qual é a diferença entre embaixada e consulado?",
  "O que é inflação e porque sobe?",
];

const MOCK_RESPONSES: Record<string, string> = {
  default: "Esta é uma demonstração do GiraSightin. Numa versão real, a IA Girassol responderia à tua pergunta com contexto jornalístico verificado pela redacção da Rede Girassol.",
  taxa: "A **taxa BNA** é a taxa de juro de referência definida pelo Banco Nacional de Angola. Quando o BNA a sobe, os créditos bancários ficam mais caros — o que reduz o consumo e ajuda a travar a inflação. Actualmente está em 19,5%.",
  colera: "A **cólera** é uma doença causada por uma bactéria transmitida por água ou alimentos contaminados. Os sintomas principais são diarreia intensa e desidratação. O tratamento básico são os Sais de Reidratação Oral (SRO). Para te proteger: bebe água fervida, lava as mãos e cozinha bem os alimentos.",
  embaixada: "Uma **embaixada** representa o governo do teu país noutro país e trata de relações diplomáticas e políticas. Um **consulado** tem funções mais práticas: passaportes, vistos e apoio a cidadãos no estrangeiro. Todas as capitais têm embaixadas; os consulados ficam nas principais cidades.",
  inflacao: "**Inflação** é quando os preços sobem de forma generalizada e contínua. Com 23,4% de inflação, um produto que custava 1 000 Kz há um ano custa agora cerca de 1 234 Kz. As causas em Angola incluem a desvalorização do kwanza e os preços dos combustíveis.",
};

const getResponse = (q: string): string => {
  const lower = q.toLowerCase();
  if (lower.includes("taxa") || lower.includes("bna")) return MOCK_RESPONSES.taxa;
  if (lower.includes("cólera") || lower.includes("colera")) return MOCK_RESPONSES.colera;
  if (lower.includes("embaixada") || lower.includes("consulado")) return MOCK_RESPONSES.embaixada;
  if (lower.includes("inflação") || lower.includes("inflacao")) return MOCK_RESPONSES.inflacao;
  return MOCK_RESPONSES.default;
};

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "ai", text: getResponse(text) }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-112px)]">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center">
              <Bot size={26} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">IA Girassol</h2>
              <p className="text-sm text-muted-foreground mt-1">Faz perguntas sobre notícias, artigos ou conceitos difíceis.</p>
            </div>
            <div className="w-full space-y-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="w-full text-left card-app p-3 text-sm text-muted-foreground hover:text-foreground hover:shadow-md transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${m.role === "ai" ? "bg-gradient-primary" : "bg-muted"}`}>
                {m.role === "ai" ? <Bot size={14} className="text-white" /> : <User size={14} className="text-muted-foreground" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "ai" ? "bg-secondary text-foreground rounded-tl-sm" : "bg-gradient-primary text-white rounded-tr-sm"}`}>
                {m.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-white px-4 py-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Faz uma pergunta..."
          className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button onClick={() => send(input)} disabled={!input.trim() || loading} className="btn-primary !py-2.5 !px-4 shrink-0">
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
