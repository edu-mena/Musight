import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, FileText, MessageSquare, TrendingUp, PenLine, Lightbulb, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, type ApiArticle, type ApiDebate } from "../../lib/apiClient";
import { statusMeta } from "../../data/researcherData";

function Spinner() {
  return <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />;
}

export const ResearcherHome = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [debates, setDebates] = useState<ApiDebate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiArticle[]>("/researcher/articles"),
      api.get<ApiDebate[]>("/researcher/debates"),
    ])
      .then(([a, d]) => { setArticles(a); setDebates(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalViews = articles.reduce((s, a) => s + (a.views ?? 0), 0);
  const totalPublished = articles.filter((a) => a.status === "publicado").length;
  const totalDebates = debates.filter((d) => d.status === "publicado").length;
  const totalComments = articles.reduce((s, a) => s + (a.comment_count ?? 0), 0) +
    debates.reduce((s, d) => s + (d.comment_count ?? 0), 0);
  const totalContent = articles.length + debates.length;
  const avgEngagement = totalContent > 0 ? Math.round(totalComments / totalContent) : 0;

  const stats = [
    { icon: Eye, label: "Visualizações", value: totalViews.toLocaleString("pt-PT") },
    { icon: FileText, label: "Publicados", value: totalPublished },
    { icon: MessageSquare, label: "Debates", value: totalDebates },
    { icon: TrendingUp, label: "Engajamento médio", value: avgEngagement },
  ];

  const recent = articles.slice(0, 3);
  const firstName = user?.name?.split(" ")[0] ?? "Pesquisador";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="font-display font-bold text-2xl md:text-3xl">Bom dia, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground font-mono-accent">Área de Pesquisador</p>
      </header>

      {/* Métricas */}
      <section className="grid grid-cols-2 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card-app p-4 flex flex-col gap-2">
              <Icon size={18} strokeWidth={1.8} className="text-violet-600" />
              <div className="font-display font-bold text-2xl text-primary leading-none">{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-mono-accent uppercase">{s.label}</div>
            </div>
          );
        })}
      </section>

      {/* Conteúdo recente */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Os meus últimos conteúdos</h2>
          <Link to="/researcher/conteudos" className="text-xs font-semibold text-violet-700 hover:underline flex items-center gap-0.5">
            Ver tudo <ArrowRight size={12} />
          </Link>
        </div>
        {loading ? (
          <div className="card-app p-6 flex justify-center"><Spinner /></div>
        ) : recent.length === 0 ? (
          <div className="card-app p-6 text-center text-sm text-muted-foreground">Ainda não tens conteúdos publicados.</div>
        ) : (
          <div className="space-y-3">
            {recent.map((a) => {
              const st = statusMeta[a.status as keyof typeof statusMeta] ?? { label: a.status, cls: "bg-muted text-muted-foreground" };
              return (
                <article key={a.id} className="card-app p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="pill bg-primary/10 text-primary">{a.category}</span>
                      <span className={`pill ${st.cls}`}>{st.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono-accent shrink-0">{a.date}</span>
                  </div>
                  <h3 className="font-semibold text-sm leading-snug">{a.title}</h3>
                  <div className="text-[10px] text-muted-foreground font-mono-accent flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye size={11} />{a.views ?? 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={11} />{a.comment_count ?? 0}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Acções rápidas */}
      <section>
        <h2 className="font-display font-bold text-lg mb-3">Acções rápidas</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/researcher/publicar-artigo" className="card-app p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-violet-100 grid place-items-center text-violet-700 shrink-0">
              <PenLine size={22} strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold">Publicar artigo</div>
              <div className="text-xs text-muted-foreground">Submete um novo artigo para revisão</div>
            </div>
            <ArrowRight size={18} className="text-muted-foreground shrink-0" />
          </Link>
          <Link to="/researcher/criar-debate" className="card-app p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-violet-100 grid place-items-center text-violet-700 shrink-0">
              <MessageSquare size={22} strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold">Criar debate</div>
              <div className="text-xs text-muted-foreground">Abre uma nova discussão pública</div>
            </div>
            <ArrowRight size={18} className="text-muted-foreground shrink-0" />
          </Link>
        </div>
      </section>

      {/* Dicas editoriais */}
      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <Lightbulb size={20} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={1.8} />
        <div className="space-y-1.5">
          <h3 className="font-display font-semibold text-amber-900">Lembra-te:</h3>
          <ul className="text-sm text-amber-900/80 space-y-1 list-disc list-inside marker:text-amber-600">
            <li>Artigos sem referências são classificados como Opinião.</li>
            <li>Conteúdos em revisão são avaliados em até 48 horas.</li>
            <li>Usa os 3 níveis de explicação para chegar a mais leitores.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
