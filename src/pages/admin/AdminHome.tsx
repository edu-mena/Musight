import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  MessageSquare,
  Globe,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  api,
  type AdminStats,
  type ApiArticle,
  type ApiDebate,
  type Paginated,
} from "../../lib/apiClient";

function Spinner() {
  return (
    <div className="w-6 h-6 rounded-full border-2 border-slate-400 border-t-transparent animate-spin mx-auto" />
  );
}

export const AdminHome = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingArticles, setPendingArticles] = useState<ApiArticle[]>([]);
  const [pendingDebates, setPendingDebates] = useState<ApiDebate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<AdminStats>("/admin/stats"),
      // /admin/articles e /admin/debates devolvem um envelope paginado
      // ({ articles: [...] } / { debates: [...] }), igual às rotas públicas
      // /articles e /debates — não um array solto.
      api.get<Paginated<ApiArticle>>("/admin/articles?status=em_revisao&limit=3"),
      api.get<Paginated<ApiDebate>>("/admin/debates?status=em_revisao&limit=3"),
    ])
      .then(([s, a, d]) => {
        setStats(s);
        setPendingArticles(Array.isArray(a.articles) ? a.articles : []);
        setPendingDebates(Array.isArray(d.debates) ? d.debates : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = stats
    ? [
        {
          icon: Users,
          label: "Total utilizadores",
          value: (stats.totalUsers ?? 0).toLocaleString("pt-PT"),
          sub: `+${stats.usersThisMonth ?? 0} este mês`,
          alert: false,
        },
        {
          icon: FileText,
          label: "Artigos em revisão",
          value: stats.articlesInReview ?? 0,
          alert: stats.articlesInReview > 0,
        },
        {
          icon: MessageSquare,
          label: "Debates em revisão",
          value: stats.debatesInReview ?? 0,
          alert: stats.debatesInReview > 0,
        },
        { icon: Globe, label: "Total publicados", value: stats.totalPublished ?? 0, alert: false },
        {
          icon: UserCheck,
          label: "Candidaturas pendentes",
          value: stats.pendingApplications ?? 0,
          alert: stats.pendingApplications > 0,
        },
        { icon: TrendingUp, label: "Debates activos", value: stats.totalDebates, alert: false },
      ]
    : [];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="font-display font-bold text-2xl md:text-3xl">Painel de Administração</h1>
        <p className="text-sm text-muted-foreground font-mono-accent">
          Visão geral da plataforma MuSight
        </p>
      </header>

      {/* KPIs */}
      {loading ? (
        <div className="card-app p-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.label}
                className={`card-app p-4 flex flex-col gap-2 ${k.alert ? "border-amber-300 bg-amber-50" : ""}`}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className={k.alert ? "text-amber-600" : "text-slate-600"}
                />
                <div
                  className={`font-display font-bold text-2xl leading-none ${k.alert ? "text-amber-700" : "text-primary"}`}
                >
                  {k.value}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono-accent uppercase">
                  {k.label}
                </div>
                {"sub" in k && k.sub && (
                  <div className="text-[10px] text-emerald-600 font-mono-accent">{k.sub}</div>
                )}
              </div>
            );
          })}
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Pending articles */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display font-bold text-lg">Artigos a rever</h2>
            <Link
              to="/admin/artigos"
              className="text-xs font-semibold text-slate-700 hover:underline flex items-center gap-0.5"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {pendingArticles.length === 0 ? (
            <div className="card-app p-6 text-center text-sm text-muted-foreground">
              Sem artigos pendentes.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingArticles.map((a) => (
                <article key={a.id} className="card-app p-3 flex gap-3 items-start">
                  <Clock size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug line-clamp-2">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="pill bg-primary/10 text-primary">{a.category}</span>
                      <span className="text-[10px] text-muted-foreground font-mono-accent">
                        {a.authorId}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Pending debates */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display font-bold text-lg">Debates a rever</h2>
            <Link
              to="/admin/debates"
              className="text-xs font-semibold text-slate-700 hover:underline flex items-center gap-0.5"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          {pendingDebates.length === 0 ? (
            <div className="card-app p-6 text-center text-sm text-muted-foreground">
              Sem debates pendentes.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingDebates.map((d) => (
                <article key={d.id} className="card-app p-3 flex gap-3 items-start">
                  <Clock size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug line-clamp-2">{d.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="pill bg-violet-100 text-violet-700">{d.category}</span>
                      <span className="text-[10px] text-muted-foreground font-mono-accent">
                        {d.authorId}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
