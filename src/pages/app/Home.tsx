import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, type ApiArticle, type ApiDebate } from "../../lib/apiClient";
import {
  Bot,
  Headphones,
  Play,
  Users,
  MessageSquare,
  Eye,
  ChevronRight,
  X,
  BookOpen,
} from "lucide-react";

function Spinner() {
  return (
    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
  );
}

// Backend às vezes devolve "host/caminho" sem protocolo — normaliza antes de usar.
function withProtocol(url: string | null | undefined): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function greetingForHour(hour: number) {
  if (hour < 12) return "Bom dia";
  if (hour < 19) return "Boa tarde";
  return "Boa noite";
}

// Linha de estatísticas reaproveitada nos cards de debate — ícones em
// cinzento escuro, nunca laranja: laranja fica só para a acção principal.
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

  useEffect(() => {
    Promise.all([
      api.get<{ articles: ApiArticle[]; total: number; page: number; limit: number }>(
        "/articles?limit=3",
      ),
      api.get<{ debates: ApiDebate[]; total: number; page: number; limit: number }>(
        "/debates?limit=4",
      ),
    ])
      .then(([a, d]) => {
        setArticles(a.articles);
        setDebates(d.debates);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Trava o scroll da Home por trás do bottom sheet, sem a desmontar.
  useEffect(() => {
    document.body.style.overflow = selectedDebate ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDebate]);

  const safeDebates = Array.isArray(debates) ? debates : [];
  const hotDebate = safeDebates.find((d) => d.hot) ?? safeDebates[0];
  const otherDebates = safeDebates.filter((d) => d.id !== hotDebate?.id);

  const safeArticles = Array.isArray(articles) ? articles : [];
  const topArticle = safeArticles[0];
  const otherArticles = safeArticles.slice(1);

  const contributionsOf = (d: ApiDebate) =>
    typeof d.comments?.length === "number" ? d.comments.length : null;

  return (
    <div className="px-4 py-5 space-y-8">
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-sm">{greetingForHour(new Date().getHours())},</p>
        <h1 className="font-display font-bold text-2xl text-foreground">
          {user?.name?.split(" ")[0]}
        </h1>
      </div>

      {/* Debates — secção principal */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Debates</h2>
          <Link
            to="/app/debates"
            className="text-xs text-muted-foreground font-semibold flex items-center gap-0.5 hover:text-foreground transition-colors"
          >
            Ver todos <ChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="card-app p-6 flex justify-center">
            <Spinner />
          </div>
        ) : hotDebate ? (
          <>
            {/* Hero: debate em destaque — tratamento editorial escuro em vez
                de um placeholder de imagem, já que Debate não tem campo de
                imagem no schema. */}
            <button
              onClick={() => setSelectedDebate(hotDebate)}
              className="relative block w-full text-left rounded-[1.75rem] overflow-hidden bg-surface-dark text-white p-6 min-h-[240px] flex flex-col justify-end shadow-[var(--shadow-lift)]"
            >
              <div className="absolute inset-0 bg-radial-amber pointer-events-none" />
              <div className="relative z-10 space-y-3">
                <span className="font-mono-accent text-[10px] text-primary">Em destaque</span>
                <div>
                  <span className="pill bg-white/10 text-white backdrop-blur-sm">
                    {hotDebate.category}
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl leading-snug">{hotDebate.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-2">
                  {hotDebate.summary}
                </p>
                <StatRow
                  tone="dark"
                  items={[
                    { icon: Users, value: hotDebate.participants },
                    { icon: MessageSquare, value: hotDebate.expertsCount + " especialistas" },
                    ...(contributionsOf(hotDebate) !== null
                      ? [
                          {
                            icon: MessageSquare,
                            value: contributionsOf(hotDebate)! + " contributos",
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            </button>

            {/* Restantes debates — cards compactos e claros */}
            {otherDebates.length > 0 && (
              <div className="space-y-2.5">
                {otherDebates.map((d) => {
                  const contributions = contributionsOf(d);
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDebate(d)}
                      className="card-app w-full text-left p-4 hover:shadow-md transition-shadow"
                    >
                      <span className="pill bg-secondary text-foreground/70">{d.category}</span>
                      <h4 className="font-display font-bold text-sm leading-snug mt-2">
                        {d.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {d.summary}
                      </p>
                      <div className="mt-2.5">
                        <StatRow
                          items={[
                            { icon: Users, value: d.participants },
                            ...(contributions !== null
                              ? [{ icon: MessageSquare, value: contributions + " contributos" }]
                              : []),
                          ]}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="card-app p-6 text-center text-sm text-muted-foreground">
            Em breve novos debates.
          </div>
        )}
      </section>

      {/* Artigos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg">Artigos</h2>
          <Link
            to="/app/artigos"
            className="text-xs text-muted-foreground font-semibold flex items-center gap-0.5 hover:text-foreground transition-colors"
          >
            Ver todos <ChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="card-app p-6 flex justify-center">
            <Spinner />
          </div>
        ) : topArticle ? (
          <>
            {/* Hero de artigo: imagem grande real + CTA para ouvir/ler */}
            {(() => {
              const cover = withProtocol(topArticle.image);
              return (
                <Link
                  to={`/app/artigos/${topArticle.id}`}
                  className="card-app block overflow-hidden group"
                >
                  <div className="relative aspect-[4/3] bg-secondary">
                    {cover ? (
                      <img
                        src={cover}
                        alt={topArticle.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={28} className="text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="pill bg-white/95 text-foreground flex items-center gap-1.5 shadow-sm">
                        {topArticle.hasAudio ? (
                          <>
                            <Play size={11} className="text-primary" /> Ouvir matéria
                          </>
                        ) : (
                          <>
                            <BookOpen size={11} className="text-primary" /> Ler matéria
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="font-mono-accent text-[10px] uppercase text-muted-foreground">
                      {topArticle.category}
                    </span>
                    <h3 className="font-display font-bold text-base leading-snug mt-1">
                      {topArticle.title}
                    </h3>
                    <StatRow
                      items={[
                        { icon: Eye, value: topArticle.views },
                        ...(topArticle.hasAudio && topArticle.audioDuration
                          ? [{ icon: Headphones, value: topArticle.audioDuration }]
                          : []),
                      ]}
                    />
                  </div>
                </Link>
              );
            })()}

            {/* Restantes artigos — lista compacta com miniatura real */}
            {otherArticles.length > 0 && (
              <div className="space-y-2.5">
                {otherArticles.map((a) => {
                  const thumb = withProtocol(a.image);
                  return (
                    <Link
                      key={a.id}
                      to={`/app/artigos/${a.id}`}
                      className="card-app flex gap-3 p-3 hover:shadow-md transition-shadow"
                    >
                      <div className="w-16 h-16 rounded-xl bg-secondary shrink-0 overflow-hidden flex items-center justify-center">
                        {thumb ? (
                          <img src={thumb} alt={a.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen size={18} className="text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-mono-accent text-[10px] uppercase text-muted-foreground">
                          {a.category}
                        </span>
                        <h4 className="font-display font-bold text-sm leading-snug mt-0.5">
                          {a.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          {a.hasAudio && (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                              <Headphones size={10} /> {a.audioDuration}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Eye size={10} /> {a.views}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="card-app p-6 text-center text-sm text-muted-foreground">
            Em breve novos artigos.
          </div>
        )}
      </section>

      {/* Weza — discreta, um único toque de laranja na seta */}
      <Link
        to="/app/ia"
        className="card-app flex items-center gap-3 p-4 hover:shadow-md transition-shadow"
      >
        <div className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center shrink-0">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-sm">Perguntar à Weza</p>
          <p className="text-xs text-muted-foreground">
            Dúvidas sobre uma notícia? Pergunta com contexto.
          </p>
        </div>
        <ChevronRight size={16} className="text-primary shrink-0" />
      </Link>

      {/* Bottom sheet — pré-visualização do debate, sem fechar a Home */}
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
