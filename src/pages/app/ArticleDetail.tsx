import { useState, useRef, useEffect } from "react";
import React from "react";
import { useParams, Link } from "react-router-dom";
import { api, type ApiArticle } from "../../lib/apiClient";
import { TermTooltip } from "../../components/ui/TermTooltip";
import { AIResponseModal } from "../../components/ui/AIResponseModal";
import {
  ChevronLeft,
  Headphones,
  Play,
  Pause,
  Bot,
  Send,
  ExternalLink,
  BookMarked,
  MessageSquareQuote,
  Sprout,
  GraduationCap,
  Sparkles,
  ChevronDown,
} from "lucide-react";

function Spinner() {
  return (
    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
  );
}

// Garante que URLs vindas da API sempre tenham protocolo. O backend às vezes
// devolve "host/caminho" sem "https://" na frente (visto em audioSrc/image),
// o que faz o navegador tratar como caminho relativo e falhar ao carregar.
function withProtocol(url: string | null | undefined): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

// O nível não é uma categoria — é uma escala de profundidade. Um ícone
// crescente comunica isso melhor do que 3 gradientes de cor desligados
// entre si (verde/laranja/roxo), que competiam com o acento da marca.
const levelIcons = {
  basico: Sprout,
  intermedio: GraduationCap,
  avancado: Sparkles,
};

export const ArticleDetail = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<"basico" | "intermedio" | "avancado">("basico");
  const [isPlaying, setIsPlaying] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      // GET /articles/:id devolve { article: {...} }, não o artigo direto
      .get<{ article: ApiArticle }>(`/articles/${id}`)
      .then((res) => setArticle(res.article))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const [question, setQuestion] = useState("");
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    loading: boolean;
    response: string | null;
    error: string | null;
    context: string;
  }>({ isOpen: false, loading: false, response: null, error: null, context: "" });

  const handleAsk = async (q: string) => {
    if (!article || !q.trim()) return;
    setAiModal({ isOpen: true, loading: true, response: null, error: null, context: q });
    setQuestion("");
    try {
      const res = await api.post<{ answer: string }>("/weza", {
        message: q.trim(),
        article_id: article.id,
      });
      setAiModal((s) => ({ ...s, loading: false, response: res.answer }));
    } catch (e) {
      setAiModal((s) => ({ ...s, loading: false, error: (e as Error).message }));
    }
  };

  if (loading)
    return (
      <div className="px-4 py-8 flex justify-center">
        <Spinner />
      </div>
    );

  if (!article)
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground">Artigo não encontrado.</p>
        <Link to="/app/artigos" className="text-primary font-semibold mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );

  const isOpinion = !article.references?.length;
  const levels = Array.isArray(article.levels) ? article.levels : [];
  const keyTerms = Array.isArray(article.keyTerms) ? article.keyTerms : [];
  const currentLevel = levels.find((l) => l.level === level) ?? levels[0];
  const coverImage = withProtocol(article.image);
  const audioSrc = withProtocol(article.audioSrc);

  const renderTextWithTerms = (text: string) => {
    const parts: (string | React.ReactElement)[] = [text];
    keyTerms.forEach((kt) => {
      const result: (string | React.ReactElement)[] = [];
      parts.forEach((part) => {
        if (typeof part !== "string") {
          result.push(part);
          return;
        }
        const idx = part.indexOf(kt.term);
        if (idx === -1) {
          result.push(part);
          return;
        }
        result.push(part.slice(0, idx));
        result.push(<TermTooltip key={kt.term} term={kt.term} definition={kt.definition} />);
        result.push(part.slice(idx + kt.term.length));
      });
      parts.splice(0, parts.length, ...result);
    });
    return parts;
  };

  return (
    <>
      <div className="pb-4">
        {/* Header — flutua sobre o hero em vez de empurrar o layout */}
        <div className="fixed top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between">
          <Link
            to="/app/artigos"
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
              coverImage
                ? "bg-black/30 text-white"
                : "bg-white/90 text-foreground border border-border"
            }`}
          >
            <ChevronLeft size={17} />
          </Link>
        </div>

        {/* Hero — a imagem carrega o peso visual que antes estava no player laranja */}
        {coverImage ? (
          <div className="relative w-full aspect-[4/5] bg-surface-dark">
            <img
              src={coverImage}
              alt={article.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="pill bg-white/15 text-white backdrop-blur-sm border border-white/20">
                  {article.category}
                </span>
                {isOpinion && (
                  <span className="flex items-center gap-1 pill bg-amber-500/20 text-amber-200 border border-amber-300/30">
                    <MessageSquareQuote size={11} /> Opinião
                  </span>
                )}
              </div>
              <h1 className="font-display font-bold text-2xl leading-snug text-white">
                {article.title}
              </h1>
              <p className="font-mono-accent text-[10px] uppercase text-white/60">
                {article.articleDate}
              </p>
            </div>
          </div>
        ) : (
          <div className="px-4 pt-14 pb-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="pill bg-secondary text-foreground">{article.category}</span>
              {isOpinion && (
                <span className="flex items-center gap-1 pill bg-amber-50 text-amber-700 border border-amber-200">
                  <MessageSquareQuote size={11} /> Opinião
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-2xl leading-snug">{article.title}</h1>
            <p className="font-mono-accent text-[10px] uppercase text-muted-foreground">
              {article.articleDate}
            </p>
          </div>
        )}

        <div className="px-4 py-5 space-y-6">
          {/* Áudio — barra fina e escura, não um bloco de acento */}
          {article.hasAudio && (
            <>
              {audioSrc && (
                <audio ref={audioRef} src={audioSrc} onEnded={() => setIsPlaying(false)} />
              )}
              <div className="rounded-2xl bg-surface-dark px-4 py-3 flex items-center gap-3 text-white">
                <button
                  onClick={audioSrc ? togglePlay : undefined}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                </button>
                <div className="min-w-0">
                  <div className="font-semibold text-xs flex items-center gap-1.5">
                    <Headphones size={12} className="text-white/60" /> Girassol Lê
                  </div>
                  <div className="text-white/50 text-[11px]">
                    {article.audioDuration} · Narração em português
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Seletor de nível — profundidade, não categoria: um ícone crescente
              substitui os 3 gradientes de cor que competiam entre si */}
          {levels.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-semibold mb-2">
                Nível de explicação
              </p>
              <div className="flex gap-2">
                {levels.map((l) => {
                  const Icon = levelIcons[l.level];
                  const active = level === l.level;
                  return (
                    <button
                      key={l.level}
                      onClick={() => setLevel(l.level)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                        active
                          ? "bg-surface-dark text-white border-transparent"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      <Icon size={14} className={active ? "text-primary" : "opacity-60"} />
                      <span>{l.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Texto do artigo */}
          {currentLevel && (
            <div className="card-app p-5">
              <p className="text-base leading-relaxed font-display">
                {renderTextWithTerms(currentLevel.content)}
              </p>
            </div>
          )}

          {/* Glossário — colapsado por omissão para não competir com o corpo do artigo */}
          {keyTerms.length > 0 && (
            <div>
              <button
                onClick={() => setGlossaryOpen((v) => !v)}
                className="w-full flex items-center justify-between"
              >
                <h2 className="font-display font-bold text-base">
                  Glossário de termos{" "}
                  <span className="text-muted-foreground font-normal">({keyTerms.length})</span>
                </h2>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform ${glossaryOpen ? "rotate-180" : ""}`}
                />
              </button>
              {glossaryOpen && (
                <div className="space-y-2 mt-3">
                  {keyTerms.map((kt) => (
                    <div key={kt.term} className="card-app p-4">
                      <div className="font-semibold text-sm mb-1">{kt.term}</div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {kt.definition}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Referências ou aviso de opinião */}
          {isOpinion ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <MessageSquareQuote size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-amber-800">Artigo de Opinião</p>
                <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                  Este conteúdo não apresenta referências bibliográficas verificáveis. Representa o
                  ponto de vista do autor e não constitui reportagem factual.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-display font-bold text-base mb-3 flex items-center gap-2">
                <BookMarked size={16} className="text-muted-foreground" /> Referências
              </h2>
              <div className="space-y-2">
                {article.references!.map((ref, i) => (
                  <div key={i} className="card-app px-4 py-3 flex items-start gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground font-mono-accent mt-0.5 shrink-0 w-4">
                      {i + 1}
                    </span>
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground hover:text-primary transition-colors leading-snug flex-1 flex items-start gap-1"
                      >
                        {ref.label}
                        <ExternalLink size={11} className="shrink-0 mt-0.5 text-muted-foreground" />
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-snug flex-1">
                        {ref.label}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perguntar à Weza — laranja reservado só ao botão de enviar */}
          <div className="card-app p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-surface-dark flex items-center justify-center shrink-0">
                <Bot size={14} className="text-primary" />
              </div>
              <p className="font-display font-bold text-sm">Perguntar à Weza</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                "Explica com um exemplo prático",
                "Qual o impacto no dia a dia?",
                "Quais são os riscos?",
                "O que diz a oposição sobre isto?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleAsk(q)}
                  className="px-3 py-1.5 rounded-full border border-border bg-secondary text-[11px] font-semibold text-foreground hover:border-foreground/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex gap-2 items-end">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk(question);
                  }
                }}
                placeholder="Escreve a tua pergunta…"
                rows={2}
                className="flex-1 rounded-xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <button
                onClick={() => handleAsk(question)}
                disabled={!question.trim()}
                className="btn-primary !py-2 !px-3 shrink-0 self-end"
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Autor */}
          <p className="text-[11px] text-muted-foreground text-center">
            Por <span className="font-semibold">{article.authorId}</span>
          </p>
        </div>
      </div>
      <AIResponseModal
        isOpen={aiModal.isOpen}
        onClose={() => setAiModal((s) => ({ ...s, isOpen: false }))}
        loading={aiModal.loading}
        response={aiModal.response}
        error={aiModal.error}
        context={aiModal.context}
      />
    </>
  );
};
