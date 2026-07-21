import { useEffect, useState } from "react";
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
  const safeArticles = Array.isArray(articles) ? articles : [];

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

      {/* Artigos — Feed de notícias com cards empilhados */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-display font-bold text-lg">Artigos recentes</h2>
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
        ) : safeArticles.length > 0 ? (
          <div className="space-y-3">
            {safeArticles.map((article) => {
              const cover = withProtocol(article.image);
              return (
                <Link
                  key={article.id}
                  to={`/app/artigos/${article.id}`}
                  className="card-app block overflow-hidden group"
                >
                  {/* Imagem — full width com fallback */}
                  <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
                    {cover ? (
                      <img
                        src={cover}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={28} className="text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo do card */}
                  <div className="p-4 space-y-3">
                    {/* Categoria e áudio badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="pill bg-secondary text-foreground/70 text-[10px] font-mono-accent uppercase">
                        {article.category}
                      </span>
                      {article.hasAudio && (
                        <span className="flex items-center gap-1 pill bg-primary/10 text-primary text-[10px] font-semibold">
                          <Headphones size={10} /> {article.audioDuration}
                        </span>
                      )}
                    </div>

                    {/* Título */}
                    <h3 className="font-display font-bold text-base leading-snug group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>

                    {/* Stats de engagement */}
                    <StatRow
                      items={[
                        { icon: Eye, value: article.views },
                        ...(article.hasAudio ? [{ icon: Headphones, value: "Áudio" }] : []),
                      ]}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
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

      {/* Debates — por último. Sem destaque, cards neutros num carrossel
          horizontal. Dados minimizados de propósito: o clique já abre o
          bottom sheet com o resumo completo, então o card só precisa de
          identificar o debate, não de o explicar. */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="font-display font-bold text-lg">O que acha disso:</h2>
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
        ) : safeDebates.length > 0 ? (
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
            {safeDebates.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDebate(d)}
                className="snap-start shrink-0 w-40 text-left rounded-2xl bg-secondary p-3.5 hover:bg-secondary/70 transition-colors"
              >
                <span className="text-[10px] font-mono-accent uppercase text-muted-foreground">
                  {d.category}
                </span>
                <h4 className="font-display font-bold text-sm leading-snug mt-1 line-clamp-3">
                  {d.title}
                </h4>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-2.5">
                  <Users size={11} /> {d.participants}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="card-app p-6 text-center text-sm text-muted-foreground">
            Em breve novos debates.
          </div>
        )}
      </section>

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
