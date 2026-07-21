import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  MessageSquare,
  Globe,
  UserCheck,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import {
  api,
  adminApi,
  type AdminStats,
  type ApiArticle,
  type ApiDebate,
  type Paginated,
} from "../../lib/apiClient";

function Spinner() {
  return (
    <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin mx-auto" />
  );
}

type Stat = {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
  alert?: boolean;
};

// Cauda de dois dígitos ("01", "02"...) porque estas listas SÃO uma fila real
// de revisão por ordem de chegada — a numeração transmite posição na fila,
// não é decoração.
function QueueRow({
  index,
  href,
  title,
  category,
  categoryTone,
  author,
}: {
  index: number;
  href: string;
  title: string;
  category: string;
  categoryTone: "primary" | "violet";
  author: string | number;
}) {
  const tone =
    categoryTone === "primary" ? "text-slate-700 bg-slate-100" : "text-violet-700 bg-violet-50";

  return (
    <Link
      to={href}
      className="group flex items-center gap-3 py-3 px-1 -mx-1 rounded-md hover:bg-slate-50 transition-colors"
    >
      <span className="font-mono-accent text-[11px] text-slate-400 w-5 shrink-0 tabular-nums">
        {String(index).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug truncate text-slate-800">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${tone}`}>
            {category}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono-accent truncate">
            {author}
          </span>
        </div>
      </div>
      <ChevronRight
        size={14}
        className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0"
      />
    </Link>
  );
}

function QueueSection({
  title,
  viewAllHref,
  emptyLabel,
  children,
  isEmpty,
}: {
  title: string;
  viewAllHref: string;
  emptyLabel: string;
  children: React.ReactNode;
  isEmpty: boolean;
}) {
  return (
    <section className="card-app p-4">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-display font-bold text-base text-slate-900">{title}</h2>
        <Link
          to={viewAllHref}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Ver todos
        </Link>
      </div>
      {isEmpty ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="divide-y divide-slate-100">{children}</div>
      )}
    </section>
  );
}

export const AdminHome = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingArticles, setPendingArticles] = useState<ApiArticle[]>([]);
  const [pendingDebates, setPendingDebates] = useState<ApiDebate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.stats(),
      api.get<Paginated<ApiArticle>>("/admin/articles?status=em_revisao&limit=3"),
      api.get<Paginated<ApiDebate>>("/admin/debates?status=em_revisao&limit=3"),
    ])
      .then(([s, a, d]) => {
        setStats(s.stats);
        setPendingArticles(Array.isArray(a.articles) ? a.articles : []);
        setPendingDebates(Array.isArray(d.debates) ? d.debates : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats_: Stat[] = stats
    ? [
        {
          icon: Users,
          label: "Utilizadores",
          value: (stats.totalUsers ?? 0).toLocaleString("pt-PT"),
          sub: `+${stats.usersThisMonth ?? 0} este mês`,
        },
        {
          icon: FileText,
          label: "Artigos em revisão",
          value: stats.articlesInReview ?? 0,
          alert: (stats.articlesInReview ?? 0) > 0,
        },
        {
          icon: MessageSquare,
          label: "Debates em revisão",
          value: stats.debatesInReview ?? 0,
          alert: (stats.debatesInReview ?? 0) > 0,
        },
        { icon: Globe, label: "Publicados", value: stats.totalPublished ?? 0 },
        {
          icon: UserCheck,
          label: "Candidaturas",
          value: stats.pendingApplications ?? 0,
          alert: (stats.pendingApplications ?? 0) > 0,
        },
        { icon: TrendingUp, label: "Debates activos", value: stats.totalDebates ?? 0 },
      ]
    : [];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900">
          Painel de Administração
        </h1>
        <p className="text-sm text-muted-foreground font-mono-accent">
          Visão geral da plataforma MuSight
        </p>
      </header>

      {/* Uma única faixa de estatísticas em vez de seis cartões repetidos:
          menos ruído visual, mais fácil de escanear numa linha. */}
      {loading ? (
        <div className="card-app p-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <section className="card-app flex flex-wrap md:flex-nowrap divide-x divide-y md:divide-y-0 divide-slate-100">
          {stats_.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex-1 basis-1/2 md:basis-0 min-w-[130px] px-4 py-4 first:pl-4"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={13} strokeWidth={2} className="text-slate-400 shrink-0" />
                  {s.alert && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                </div>
                <div
                  className={`font-display font-bold text-xl leading-none ${
                    s.alert ? "text-amber-700" : "text-slate-900"
                  }`}
                >
                  {s.value}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono-accent uppercase tracking-wide mt-1.5">
                  {s.label}
                </div>
                {s.sub && (
                  <div className="text-[10px] text-emerald-600 font-mono-accent mt-0.5">
                    {s.sub}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <QueueSection
          title="Artigos a rever"
          viewAllHref="/admin/artigos"
          emptyLabel="Sem artigos pendentes. Tudo em dia."
          isEmpty={!loading && pendingArticles.length === 0}
        >
          {pendingArticles.map((a, i) => (
            <QueueRow
              key={a.id}
              index={i + 1}
              href={`/admin/artigos/${a.id}`}
              title={a.title}
              category={a.category}
              categoryTone="primary"
              author={a.authorId}
            />
          ))}
        </QueueSection>

        <QueueSection
          title="Debates a rever"
          viewAllHref="/admin/debates"
          emptyLabel="Sem debates pendentes. Tudo em dia."
          isEmpty={!loading && pendingDebates.length === 0}
        >
          {pendingDebates.map((d, i) => (
            <QueueRow
              key={d.id}
              index={i + 1}
              href={`/admin/debates/${d.id}`}
              title={d.title}
              category={d.category}
              categoryTone="violet"
              author={d.authorId}
            />
          ))}
        </QueueSection>
      </div>
    </div>
  );
};
