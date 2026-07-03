import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, type ApiDebate, type ApiComment } from "../../lib/apiClient";
import { ChevronLeft, ThumbsUp, Users, Send, Bot } from "lucide-react";
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
    api
      .get<ApiDebate>(`/debates/${id}`)
      .then((d) => {
        setDebate(d);
        setLocalComments(d.comments ?? []);
        setLikedIds(new Set((d.comments ?? []).filter((c) => c.user_liked).map((c) => c.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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

  const openAI = (context: string) =>
    setAiModal({ isOpen: true, loading: true, response: null, error: null, context });

  const closeAI = () => setAiModal((s) => ({ ...s, isOpen: false }));

  const handleAnalyseDebate = async () => {
    openAI("Análise geral do debate");
    try {
      const res = await api.post<{ answer: string }>("/weza", {
        message:
          "Faz uma análise equilibrada deste debate: resume os principais argumentos de cada lado, identifica pontos de consenso e de discordância, e fornece contexto factual sobre o tema em Angola.",
        debate_id: debate.id,
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
        message: `Avalia este argumento no contexto do debate "${debate.title}": "${c.text}". Identifica pontos fortes, eventuais lacunas, e complementa com contexto factual angolano.`,
        debate_id: debate.id,
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
      const newComment = await api.post<ApiComment>(`/debates/${debate.id}/comments`, {
        text: comment.trim(),
        side,
      });
      setLocalComments((prev) => [...prev, newComment]);
      setSubmitted(true);
      setComment("");
    } catch {
      // leave the form open so the user can retry
    } finally {
      setSubmitting(false);
    }
  };

  const sideColors = {
    favor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    contra: "bg-red-50 text-red-700 border-red-200",
    neutro: "bg-secondary text-foreground border-border",
  };

  return (
    <>
      <div className="pb-4">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
          <Link
            to="/app/debates"
            className="flex items-center gap-1 text-sm text-muted-foreground mb-2"
          >
            <ChevronLeft size={15} /> Debates
          </Link>
          <span className="pill bg-primary/10 text-primary">{debate.category}</span>
        </div>

        <div className="px-4 py-4 space-y-5">
          {/* Title + stats */}
          <div>
            <h1 className="font-display font-bold text-xl leading-snug">{debate.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{debate.summary}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={11} />
                {debate.participants} participantes
              </span>
              <span>{debate.experts} especialistas</span>
            </div>
            <button
              onClick={handleAnalyseDebate}
              className="mt-4 flex items-center gap-2 btn-primary !py-2 !px-4 !text-xs w-fit"
            >
              <Bot size={13} /> Consultar a Weza sobre este debate
            </button>
          </div>

          {/* Comments */}
          <div>
            <h2 className="font-display font-bold text-base mb-3">Contribuições</h2>

            {/* Filters */}
            <div className="space-y-2 mb-4">
              <div className="flex gap-1.5">
                {(["todos", "especialistas", "gerais"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold border transition-all capitalize ${
                      filterType === t
                        ? "bg-foreground text-white border-transparent"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {t === "todos" ? "Todos" : t === "especialistas" ? "Especialistas" : "Gerais"}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {(["todos", "favor", "neutro", "contra"] as const).map((s) => {
                  const active = filterSide === s;
                  const activeClass =
                    s === "favor"
                      ? "bg-emerald-500 text-white border-transparent"
                      : s === "contra"
                        ? "bg-red-500 text-white border-transparent"
                        : s === "neutro"
                          ? "bg-secondary text-foreground border-border"
                          : "bg-foreground text-white border-transparent";
                  return (
                    <button
                      key={s}
                      onClick={() => setFilterSide(s)}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                        active
                          ? activeClass
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {s === "todos"
                        ? "Todos"
                        : s === "favor"
                          ? "A Favor"
                          : s === "neutro"
                            ? "Neutro"
                            : "Contra"}
                    </button>
                  );
                })}
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
                  <div
                    key={c.id}
                    className={`card-app p-4 border-l-4 ${c.side === "favor" ? "border-l-emerald-400" : c.side === "contra" ? "border-l-red-400" : "border-l-border"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold ${expert ? "bg-gradient-primary" : "bg-muted"}`}
                      >
                        {expert ? c.author.name.split(" ").pop()?.[0] : c.author.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5 mb-1">
                          <span className="font-bold text-xs">{c.author.name}</span>
                          {expert && (
                            <span className="pill bg-blue-50 text-blue-600 !py-0.5 !px-2">
                              Especialista
                            </span>
                          )}
                          {c.author.verified && <span className="text-primary text-[10px]">✓</span>}
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {c.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground italic mb-1 capitalize">
                          {c.author.role}
                        </p>
                        <p className="text-sm leading-relaxed">{c.text}</p>
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

          {/* Add comment */}
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
