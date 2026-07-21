import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, type ApiArticle, type ApiDebate } from "../../lib/apiClient";
import {
  Bot,
  Headphones,
  Users,
  MessageSquare,
  Eye,
  ChevronRight,
  X,
  BookOpen,
  Flame,
  TrendingUp,
} from "lucide-react";

function Spinner() {
  return (
    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
  );
}

function withProtocol(url: string | null | undefined): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 19) return "Boa tarde";
  return "Boa noite";
}

function StatRow({
  items,
  tone = "light",
}: {
  items: { icon: typeof Users; value: number | string }[];
  tone?: "light" | "dark";
}) {
  const textClass = tone === "dark" ? "text-white/70" : "text-muted-foreground";
  return (
    <div className={`flex items-center gap-4 text-xs font-medium ${textClass}`}>
      {items.map(({ icon: Icon, value }, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <Icon size={13} strokeWidth={2} />
          {value}
        </span>
      ))}
    </div>
  );
}

export const Home = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [debates, setDebates] = useState<ApiDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebate, setSelectedDebate] = useState<ApiDebate | null>(null);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const articlesScrollRef = useRef<HTMLDivElement>(null);
  const autoScrollTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    Promise.all([
      api.get<{ articles: ApiArticle[]; total: number; page: number; limit: number }>(
        "/articles?limit=6",
      ),
      api.get<{ debates: ApiDebate[]; total: number; page: number; limit: number }>(
        "/debates?limit=6",
      ),
    ])
      .then(([a, d]) => {
        setArticles(a.articles);
        setDebates(d.debates);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll do carrossel de artigos
  useEffect(() => {
    if (articles.length === 0) return;

    autoScrollTimer.current = setInterval(() => {
      setCurrentArticleIndex((prev) => (prev + 1) % articles.length);
    }, 5000); // Muda a cada 5 segundos

    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, [articles.length]);

  // Scroll automático do container
  useEffect(() => {
    if (!articlesScrollRef.current || articles.length === 0) return;

    const cardWidth = articlesScrollRef.current.offsetWidth;
    articlesScrollRef.current.scrollLeft = currentArticleIndex * cardWidth;
  }, [currentArticleIndex, articles.length]);

  useEffect(() => {
    document.body.style.overflow = selectedDebate ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDebate]);

  const safeDebates = Array.isArray(debates) ? debates : [];
  const safeArticles = Array.isArray(articles) ? articles : [];

  const contributionsOf = (d: ApiDebate) =>
    typeof d.comments?.length === "number" ? d.comments.length : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="px-4 py-5 space-y-8">
        {/* Greeting */}
        <div>
          <p className="text-muted-foreground text-sm">{greetingForHour(new Date().getHours())},</p>
          <h1 className="font-display font-bold text-3xl text-foreground">
            {user?.name?.split(" ")[0]}
          </h1>
        </div>

        {/* Artigos — Carrossel Horizontal */}
        {!loading && safeArticles.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <h2 className="font-display font-bold text-lg">Leia agora</h2>
              <Link
                to="/app/artigos"
                className="text-xs text-muted-foreground font-semibold flex items-center gap-0.5 hover:text-foreground transition-colors"
              >
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>

            <div className="relative">
              {/* Carrossel */}
              <div
                ref={articlesScrollRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
                style={{ scrollBehavior: "smooth" }}
              >
                {safeArticles.map((article, idx) => {
                  const cover = withProtocol(article.image);
                  const isActive = idx === currentArticleIndex;

                  return (
                    <Link
                      key={article.id}
                      to={`/app/artigos/${article.id}`}
                      className={`
                        snap-start shrink-0 transition-all duration-300
                        ${isActive ? "w-full" : "w-[85vw] md:w-96 opacity-60 hover:opacity-100"}
                      `}
                    >
                      <div className="h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-card">
                        {/* Imagem */}
                        <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                          {cover ? (
                            <img
                              src={cover}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen size={32} className="text-muted-foreground/40" />
                            </div>
                          )}

                          {/* Gradiente overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                          {/* Badge de áudio flutuante */}
                          {article.hasAudio && (
                            <div className="absolute top-3 right-3">
                              <span className="inline-flex items-center gap-1 pill bg-primary text-white text-[10px] font-bold px-2 py-1">
                                <Headphones size={10} /> Áudio
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="pill bg-primary/10 text-primary text-[10px] font-bold uppercase">
                              {article.category}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Eye size={12} /> {article.views}
                            </div>
                          </div>

                          <h3 className="font-display font-bold text-lg leading-snug line-clamp-2">
                            {article.title}
                          </h3>

                          <div className="flex items-center gap-2 pt-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-[10px] font-bold text-white">
                              +
                            </div>
                            <span className="text-xs text-muted-foreground">Ler artigo</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Navegação — Dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {safeArticles.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentArticleIndex(idx);
                      // Reset do auto-scroll
                      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
                      autoScrollTimer.current = setInterval(() => {
                        setCurrentArticleIndex((prev) => (prev + 1) % safeArticles.length);
                      }, 5000);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentArticleIndex
                        ? "bg-primary w-8"
                        : "bg-primary/20 w-2 hover:bg-primary/40"
                    }`}
                    aria-label={`Ir para artigo ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {loading && (
          <div className="card-app p-8 flex justify-center">
            <Spinner />
          </div>
        )}

        {/* Weza — Destaque */}
        <Link
          to="/app/ia"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 hover:border-primary/40 transition-all group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Bot size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm">Perguntar à Weza</p>
              <p className="text-xs text-muted-foreground">
                Dúvidas sobre uma notícia? Pergunta com contexto.
              </p>
            </div>
            <ChevronRight size={16} className="text-primary shrink-0" />
          </div>
        </Link>

        {/* Debates — Estilo Jornal Profissional */}
        {!loading && safeDebates.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                <h2 className="font-display font-bold text-lg">O que acha disso</h2>
              </div>
              <Link
                to="/app/debates"
                className="text-xs text-muted-foreground font-semibold flex items-center gap-0.5 hover:text-foreground transition-colors"
              >
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>

            {/* Grid de debates estilo jornal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {safeDebates.map((debate, idx) => {
                const isHighlight = idx === 0;

                return (
                  <button
                    key={debate.id}
                    onClick={() => setSelectedDebate(debate)}
                    className={`
                      text-left rounded-2xl overflow-hidden
                      transition-all duration-300 hover:shadow-lg active:scale-[0.98]
                      ${
                        isHighlight
                          ? "col-span-1 md:col-span-2 bg-gradient-to-br from-surface-dark to-surface-dark/80 text-white p-5 border border-white/10"
                          : "bg-card p-4 border border-border hover:border-foreground/30"
                      }
                    `}
                  >
                    <div className={isHighlight ? "space-y-3" : "space-y-2"}>
                      {/* Badge de categoria */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`
                            pill text-[10px] font-bold uppercase
                            ${
                              isHighlight
                                ? "bg-primary/20 text-primary"
                                : "bg-secondary text-foreground/70"
                            }
                          `}
                        >
                          {debate.category}
                        </span>
                        {isHighlight && (
                          <span className="flex items-center gap-1 pill bg-red-500/20 text-red-500 text-[10px] font-bold">
                            <Flame size={10} /> Em destaque
                          </span>
                        )}
                      </div>

                      {/* Título */}
                      <h3
                        className={`
                          font-display font-bold leading-snug
                          ${isHighlight ? "text-lg line-clamp-2" : "text-base line-clamp-2"}
                        `}
                      >
                        {debate.title}
                      </h3>

                      {/* Resumo (apenas no highlight) */}
                      {isHighlight && (
                        <p className="text-sm text-white/80 line-clamp-2">{debate.summary}</p>
                      )}

                      {/* Stats */}
                      <div className={`flex items-center gap-3 ${isHighlight ? "pt-2" : ""}`}>
                        <span
                          className={`
                            flex items-center gap-1.5 font-semibold
                            ${isHighlight ? "text-white/70 text-xs" : "text-muted-foreground text-[11px]"}
                          `}
                        >
                          <Users size={isHighlight ? 13 : 11} /> {debate.participants}
                        </span>
                        <span
                          className={`
                            flex items-center gap-1.5 font-semibold
                            ${isHighlight ? "text-white/70 text-xs" : "text-muted-foreground text-[11px]"}
                          `}
                        >
                          <MessageSquare size={isHighlight ? 13 : 11} /> {debate.expertsCount}
                        </span>
                      </div>

                      {/* CTA */}
                      <div className={`flex items-center gap-2 ${isHighlight ? "pt-3" : "pt-1"}`}>
                        <div
                          className={`flex items-center gap-2 transition-transform group-hover:translate-x-1 ${
                            isHighlight
                              ? "text-primary text-sm font-bold"
                              : "text-primary text-xs font-semibold"
                          }`}
                        >
                          Ver debate
                          <ChevronRight
                            size={isHighlight ? 14 : 12}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Bottom sheet — Pré-visualização do debate */}
      {selectedDebate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            aria-label="Fechar"
            onClick={() => setSelectedDebate(null)}
            className="absolute inset-0 bg-black/50 animate-fade-in"
          />
          <div className="relative w-full max-w-md bg-white rounded-t-[1.75rem] pt-3 px-6 pb-8 max-h-[82vh] overflow-y-auto animate-slide-up shadow-[var(--shadow-lift)]">
            <div className="w-10 h-1.5 rounded-full bg-border mx-auto mb-4" />
            <button
              onClick={() => setSelectedDebate(null)}
              aria-label="Fechar"
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={15} />
            </button>

            <span className="pill bg-secondary text-foreground/70">{selectedDebate.category}</span>
            <h3 className="font-display font-bold text-xl leading-snug mt-3">
              {selectedDebate.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              {selectedDebate.summary}
            </p>

            <div className="mt-4">
              <StatRow
                items={[
                  { icon: Users, value: selectedDebate.participants + " participantes" },
                  { icon: MessageSquare, value: selectedDebate.expertsCount + " especialistas" },
                  ...(contributionsOf(selectedDebate) !== null
                    ? [
                        {
                          icon: MessageSquare,
                          value: contributionsOf(selectedDebate)! + " contributos",
                        },
                      ]
                    : []),
                ]}
              />
            </div>

            <Link
              to={`/app/debates/${selectedDebate.id}`}
              className="btn-primary w-full justify-center mt-6"
            >
              Ver debate completo <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
