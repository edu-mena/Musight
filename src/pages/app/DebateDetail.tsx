import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, type ApiDebate, type ApiComment } from "../../lib/apiClient";
import {
  ChevronLeft,
  ThumbsUp,
  Users,
  Send,
  Bot,
  Award,
  MessageCircle,
  Quote,
  SlidersHorizontal,
} from "lucide-react";
import { AIResponseModal } from "../../components/ui/AIResponseModal";
import { ContributionGuidelinesModal } from "../../components/ui/ContributionGuidelinesModal";

function Spinner() {
  return (
    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
  );
}

function isExpertComment(c: ApiComment) {
  return c.author.role === "researcher" || c.author.role === "expert";
}

export const DebateDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [debate, setDebate] = useState<ApiDebate | null>(null);
  const [loading, setLoading] = useState(true);
  const [localComments, setLocalComments] = useState<ApiComment[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [comment, setComment] = useState("");
  const [side, setSide] = useState<"favor" | "contra" | "neutro">("neutro");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [filterType, setFilterType] = useState<"todos" | "especialistas" | "gerais">("todos");
  const [filterSide, setFilterSide] = useState<"todos" | "favor" | "neutro" | "contra">("todos");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const [guidelineStep, setGuidelineStep] = useState<0 | 1 | 2>(0);
  const [hasAgreed, setHasAgreed] = useState(false);

  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    loading: boolean;
    response: string | null;
    error: string | null;
    context: string;
  }>({ isOpen: false, loading: false, response: null, error: null, context: "" });

  useEffect(() => {
    if (!id) return;
    // GET /debates/:id devolve { data: { debate: {...} } } — desembrulha o "debate"
    api
      .get<{ debate: ApiDebate }>(`/debates/${id}`)
      .then((res) => {
        const d = res.debate;
        setDebate(d);
        setLocalComments(d.comments ?? []);
        setLikedIds(new Set((d.comments ?? []).filter((c) => c.userLiked).map((c) => c.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Fecha o painel de filtros ao clicar fora dele.
  useEffect(() => {
    if (!filtersOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [filtersOpen]);

  if (loading)
    return (
      <div className="px-4 py-8 flex justify-center">
        <Spinner />
      </div>
    );

  if (!debate)
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground">Debate não encontrado.</p>
        <Link to="/app/debates" className="text-primary font-semibold mt-2 inline-block">
          Voltar
        </Link>
      </div>
    );

  const allComments = localComments;
  const filteredComments = allComments.filter((c) => {
    if (filterType === "especialistas" && !isExpertComment(c)) return false;
    if (filterType === "gerais" && isExpertComment(c)) return false;
    if (filterSide !== "todos" && c.side !== filterSide) return false;
    return true;
  });
  const filtersActive = filterType !== "todos" || filterSide !== "todos";

  const openAI = (context: string) =>
    setAiModal({ isOpen: true, loading: true, response: null, error: null, context });

  const closeAI = () => setAiModal((s) => ({ ...s, isOpen: false }));

  const handleAnalyseDebate = async () => {
    openAI("Análise geral do debate");
    try {
      // O backend espera { question }, não { message } — é o único campo aceite
      // pelo askWezaSchema. "debate_id" não é lido pelo endpoint, por isso não
      // adianta nada enviá-lo à parte; o contexto tem de ir dentro do texto.
      const res = await api.post<{ answer: string }>("/weza", {
        question: `Faz uma análise equilibrada do debate "${debate.title}" (resumo: "${debate.summary}"): resume os principais argumentos de cada lado, identifica pontos de consenso e de discordância, e fornece contexto factual sobre o tema em Angola.`,
      });
      setAiModal((s) => ({ ...s, loading: false, response: res.answer }));
    } catch (e) {
      setAiModal((s) => ({ ...s, loading: false, error: (e as Error).message }));
    }
  };

  const handleAnalyseComment = async (c: ApiComment) => {
    openAI(`Análise do comentário de ${c.author.name.split(" ")[0]}`);
    try {
      const res = await api.post<{ answer: string }>("/weza", {
        question: `Avalia este argumento no contexto do debate "${debate.title}": "${c.content}". Identifica pontos fortes, eventuais lacunas, e complementa com contexto factual angolano.`,
      });
      setAiModal((s) => ({ ...s, loading: false, response: res.answer }));
    } catch (e) {
      setAiModal((s) => ({ ...s, loading: false, error: (e as Error).message }));
    }
  };

  const handleLike = async (c: ApiComment) => {
    const alreadyLiked = likedIds.has(c.id);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (alreadyLiked) {
        next.delete(c.id);
      } else {
        next.add(c.id);
      }
      return next;
    });
    setLocalComments((prev) =>
      prev.map((cm) =>
        cm.id === c.id ? { ...cm, likes: cm.likes + (alreadyLiked ? -1 : 1) } : cm,
      ),
    );
    try {
      await api.post<unknown>(`/comments/${c.id}/like`, {});
    } catch {
      // revert optimistic update on failure
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (alreadyLiked) {
          next.add(c.id);
        } else {
          next.delete(c.id);
        }
        return next;
      });
      setLocalComments((prev) =>
        prev.map((cm) =>
          cm.id === c.id ? { ...cm, likes: cm.likes + (alreadyLiked ? 1 : -1) } : cm,
        ),
      );
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim() || submitting) return;
    setSubmitting(true);
    try {
      // POST /debates/:id/comments devolve { data: { comment: {...} } }
      const res = await api.post<{ comment: ApiComment }>(`/debates/${debate.id}/comments`, {
        text: comment.trim(),
        side,
      });
      setLocalComments((prev) => [...prev, res.comment]);
      setSubmitted(true);
      setComment("");
    } catch {
      // leave the form open so the user can retry
    } finally {
      setSubmitting(false);
    }
  };

  // Cor só onde carrega significado real (a favor / contra). O resto do
  // sistema (filtros, badges) fica em tons neutros para não competir com isto.
  const sideColors = {
    favor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    contra: "bg-red-50 text-red-700 border-red-200",
    neutro: "bg-secondary text-foreground border-border",
  };
  const sideDot = {
    favor: "bg-emerald-500",
    contra: "bg-red-500",
    neutro: "bg-muted-foreground",
  };

  return (
    <>
      <div className="pb-4">
        {/* Header flutuante sobre o hero escuro */}
        <div className="fixed top-0 left-0 right-0 z-20 px-4 py-3">
          <Link
            to="/app/debates"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/30 text-white backdrop-blur-sm"
          >
            <ChevronLeft size={17} />
          </Link>
        </div>

        {/* Hero escuro sólido, sem gradiente — a aspa estilizada no canto
            substitui o glow radial como assinatura visual. */}
        <div className="relative bg-surface-dark pt-16 pb-6 px-4 text-white overflow-hidden">
          <Quote
            size={140}
            strokeWidth={1}
            className="absolute -top-6 -right-8 text-white/5 pointer-events-none"
          />
          <div className="relative">
            <span className="pill bg-white/15 text-white border border-white/20">
              {debate.category}
            </span>
            <h1 className="font-display font-bold text-xl leading-snug mt-3">{debate.title}</h1>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">{debate.summary}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <Users size={11} />
                {debate.participants} participantes
              </span>
              <span className="flex items-center gap-1">
                <Award size={11} />
                {debate.expertsCount} especialistas
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={11} />
                {allComments.length} contributos
              </span>
            </div>
            <button
              onClick={handleAnalyseDebate}
              className="mt-4 flex items-center gap-2 btn-primary !py-2 !px-4 !text-xs w-fit"
            >
              <Bot size={13} /> Consultar a Weza sobre este debate
            </button>
          </div>
        </div>

        <div className="px-4 py-5 space-y-5">
          {/* Comentários */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-base">Contribuições</h2>

              {/* Filtros escondidos atrás de um ícone — só ocupam espaço
                  quando o utilizador realmente quer filtrar. */}
              <div className="relative" ref={filtersRef}>
                <button
                  onClick={() => setFiltersOpen((v) => !v)}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                    filtersActive
                      ? "bg-surface-dark text-white border-transparent"
                      : "border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                  aria-label="Filtrar contribuições"
                >
                  <SlidersHorizontal size={14} />
                  {filtersActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary border border-white" />
                  )}
                </button>

                {filtersOpen && (
                  <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-lg border border-border p-3 space-y-3 z-30">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Tipo
                      </p>
                      <div className="flex gap-1.5">
                        {(["todos", "especialistas", "gerais"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all capitalize ${
                              filterType === t
                                ? "bg-surface-dark text-white border-transparent"
                                : "border-border text-muted-foreground hover:border-foreground/30"
                            }`}
                          >
                            {t === "todos"
                              ? "Todos"
                              : t === "especialistas"
                                ? "Especialistas"
                                : "Gerais"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                        Posição
                      </p>
                      <div className="flex gap-1.5">
                        {(["todos", "favor", "neutro", "contra"] as const).map((s) => {
                          const active = filterSide === s;
                          return (
                            <button
                              key={s}
                              onClick={() => setFilterSide(s)}
                              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-all flex items-center justify-center gap-1 ${
                                active
                                  ? "bg-surface-dark text-white border-transparent"
                                  : "border-border text-muted-foreground hover:border-foreground/30"
                              }`}
                            >
                              {s !== "todos" && (
                                <span className={`w-1.5 h-1.5 rounded-full ${sideDot[s]}`} />
                              )}
                              {s === "todos"
                                ? "Todos"
                                : s === "favor"
                                  ? "Favor"
                                  : s === "neutro"
                                    ? "Neutro"
                                    : "Contra"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {filteredComments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhuma contribuição corresponde aos filtros.
                </p>
              )}
              {filteredComments.map((c) => {
                const expert = isExpertComment(c);
                const liked = likedIds.has(c.id);
                return (
                  <div key={c.id} className="card-app p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold ${expert ? "bg-surface-dark" : "bg-muted"}`}
                      >
                        {expert ? c.author.name.split(" ").pop()?.[0] : c.author.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5 mb-1">
                          <span className="font-bold text-xs">{c.author.name}</span>
                          {expert && (
                            <span className="flex items-center gap-1 pill bg-secondary text-foreground !py-0.5 !px-2">
                              <Award size={9} /> Especialista
                            </span>
                          )}
                          {c.author.verified && <span className="text-primary text-[10px]">✓</span>}
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {c.createdAt}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic mb-1 capitalize">
                          {c.author.role}
                        </p>
                        <p className="text-sm leading-relaxed">{c.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <button
                            onClick={() => handleLike(c)}
                            className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-primary font-semibold" : "text-muted-foreground"}`}
                          >
                            <ThumbsUp size={11} /> {c.likes}
                          </button>
                          <button
                            onClick={() => handleAnalyseComment(c)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            <Bot size={11} /> Consultar a Weza
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adicionar contribuição */}
          {submitted ? (
            <div className="card-app p-4 text-center">
              <p className="font-semibold text-emerald-600">✓ Contribuição enviada!</p>
              <p className="text-sm text-muted-foreground mt-1">
                A tua opinião será revisada pela redacção.
              </p>
            </div>
          ) : (
            <div className="card-app p-4 space-y-3">
              <h3 className="font-display font-bold text-sm">
                A tua posição, {user?.name?.split(" ")[0]}
              </h3>
              <div className="flex gap-2">
                {(["favor", "contra", "neutro"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${side === s ? sideColors[s] : "border-border text-muted-foreground"}`}
                  >
                    {s === "favor" ? "A favor" : s === "contra" ? "Contra" : "Neutro"}
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => {
                  if (!hasAgreed) setGuidelineStep(1);
                }}
                placeholder="Escreve o teu argumento..."
                rows={3}
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={!comment.trim() || submitting}
                className="btn-primary w-full !py-2.5"
              >
                <Send size={14} /> {submitting ? "A enviar…" : "Contribuir"}
              </button>
            </div>
          )}
        </div>
      </div>
      <AIResponseModal
        isOpen={aiModal.isOpen}
        onClose={closeAI}
        loading={aiModal.loading}
        response={aiModal.response}
        error={aiModal.error}
        context={aiModal.context}
      />
      {guidelineStep > 0 && (
        <ContributionGuidelinesModal
          step={guidelineStep as 1 | 2}
          onNext={() => setGuidelineStep(2)}
          onAgree={() => {
            setHasAgreed(true);
            setGuidelineStep(0);
          }}
        />
      )}
    </>
  );
};
