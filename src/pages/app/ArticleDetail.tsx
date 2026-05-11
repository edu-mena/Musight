import { useState, useRef } from "react";
import React from "react";
import { useParams, Link } from "react-router-dom";
import { articles } from "../../data/articles";
import { TermTooltip } from "../../components/ui/TermTooltip";
import { useAuth } from "../../context/AuthContext";
import { AIResponseModal } from "../../components/ui/AIResponseModal";
import { askAboutArticle } from "../../services/aiService";
import { ChevronLeft, Headphones, Play, Pause, Bot, Send } from "lucide-react";

export const ArticleDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const article = articles.find((a) => a.id === id);
  const [level, setLevel] = useState<"basico" | "intermedio" | "avancado">("basico");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      const text = await askAboutArticle(article, q.trim(), user?.name);
      setAiModal((s) => ({ ...s, loading: false, response: text }));
    } catch (e) {
      setAiModal((s) => ({ ...s, loading: false, error: (e as Error).message }));
    }
  };

  if (!article) return (
    <div className="px-4 py-8 text-center">
      <p className="text-muted-foreground">Artigo não encontrado.</p>
      <Link to="/app/artigos" className="text-primary font-semibold mt-2 inline-block">Voltar</Link>
    </div>
  );

  const currentLevel = article.levels.find((l) => l.id === level)!;

  const renderTextWithTerms = (text: string) => {
    const parts: (string | React.ReactElement)[] = [text];
    article.keyTerms.forEach((kt) => {
      const result: (string | React.ReactElement)[] = [];
      parts.forEach((part) => {
        if (typeof part !== "string") { result.push(part); return; }
        const idx = part.indexOf(kt.term);
        if (idx === -1) { result.push(part); return; }
        result.push(part.slice(0, idx));
        result.push(<TermTooltip key={kt.term} term={kt.term} definition={kt.definition} />);
        result.push(part.slice(idx + kt.term.length));
      });
      parts.splice(0, parts.length, ...result);
    });
    return parts;
  };

  const levelColors = { basico: "from-emerald-500 to-teal-600", intermedio: "from-primary to-orange-600", avancado: "from-violet-500 to-purple-700" };

  return (
    <>
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
        <Link to="/app/artigos" className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <ChevronLeft size={15} /> Artigos
        </Link>
        <span className="pill bg-primary/10 text-primary">{article.category}</span>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Title */}
        <div>
          <h1 className="font-display font-bold text-xl leading-snug">{article.title}</h1>
          <p className="font-mono-accent text-[10px] uppercase text-muted-foreground mt-2">{article.date}</p>
        </div>

        {/* Audio */}
        {article.audioAvailable && (
          <>
            {article.audioSrc && (
              <audio
                ref={audioRef}
                src={article.audioSrc}
                onEnded={() => setIsPlaying(false)}
              />
            )}
            <div className="rounded-2xl bg-gradient-primary p-4 flex items-center gap-4 text-white">
              <button
                onClick={article.audioSrc ? togglePlay : undefined}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 hover:bg-white/30 transition-colors"
              >
                {isPlaying
                  ? <Pause size={16} />
                  : <Play size={16} className="ml-0.5" />}
              </button>
              <div>
                <div className="font-semibold text-sm flex items-center gap-1.5"><Headphones size={13} /> Girassol Lê</div>
                <div className="text-white/70 text-xs">{article.audioDuration} · Narração em português</div>
              </div>
            </div>
          </>
        )}

        {/* Level selector */}
        <div>
          <p className="text-xs text-muted-foreground font-semibold mb-2">Nível de explicação</p>
          <div className="flex gap-2">
            {article.levels.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${level === l.id ? `bg-gradient-to-r ${levelColors[l.id]} text-white border-transparent` : "border-border text-muted-foreground"}`}
              >
                <div>{l.label}</div>
                <div className="text-[9px] opacity-70 mt-0.5">{l.sublabel}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Article text with clickable terms */}
        <div className="card-app p-5">
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${levelColors[level]} mb-4`}>
            {currentLevel.label}
          </div>
          <p className="text-base leading-relaxed font-display">
            {renderTextWithTerms(currentLevel.text)}
          </p>
        </div>

        {/* Key terms glossary */}
        <div>
          <h2 className="font-display font-bold text-base mb-3">Glossário de termos</h2>
          <div className="space-y-2">
            {article.keyTerms.map((kt) => (
              <div key={kt.term} className="card-app p-4">
                <div className="font-semibold text-sm text-primary mb-1">{kt.term}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{kt.definition}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ask AI */}
        <div className="card-app p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <p className="font-display font-bold text-sm">Perguntar à IA Girassol</p>
          </div>

          {/* Suggested questions */}
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
                className="px-3 py-1.5 rounded-full border border-primary/30 text-[11px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Custom question input */}
          <div className="flex gap-2 items-end">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(question); } }}
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
