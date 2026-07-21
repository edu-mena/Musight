import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  FileText,
  MessageSquare,
  TrendingUp,
  PenLine,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api, type ApiArticle, type ApiDebate } from "../../lib/apiClient";
import { statusMeta } from "../../data/researcherData";

function Spinner() {
  return (
    <div className="w-5 h-5 rounded-full border-2 border-violet-300 border-t-violet-600 animate-spin mx-auto" />
  );
}

export const ResearcherHome = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [debates, setDebates] = useState<ApiDebate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ articles: ApiArticle[]; total: number; page: number; limit: number }>(
        "/researcher/articles",
      ),
      api.get<{ debates: ApiDebate[]; total: number; page: number; limit: number }>(
        "/researcher/debates",
      ),
    ])
      .then(([a, d]) => {
        setArticles(a.articles);
        setDebates(d.debates);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalViews = articles.reduce((s, a) => s + (a.views ?? 0), 0);
  const totalPublished = articles.filter((a) => a.status === "publicado").length;
  const totalDebates = debates.filter((d) => d.status === "publicado").length;
  // Nota: d.comments só vem preenchido em GET /debates/:id (detalhe de um debate
  // específico), não na listagem /researcher/debates — por isso totalComments
  // (e avgEngagement, que depende dele) fica sempre 0 aqui. Para um número real,
  // o backend precisaria devolver uma contagem de comentários por debate na
  // query de listagem (ex: _count no Prisma).
  const totalComments = debates.reduce((s, d) => s + (d.comments?.length ?? 0), 0);
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
        <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900">
          Bom dia, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground font-mono-accent">Área de Pesquisador</p>
      </header>

      {/* Uma só faixa de métricas em vez de quatro cartões repetidos */}
      {loading ? (
        <div className="card-app p-8 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <section className="card-app grid grid-cols-2 sm:flex divide-x divide-y sm:divide-y-0 divide-slate-100">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex-1 min-w-[120px] px-4 py-4">
                <Icon size={13} strokeWidth={2} className="text-violet-400 mb-1.5" />
                <div className="font-display font-bold text-xl text-slate-900 leading-none">
                  {s.value}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono-accent uppercase tracking-wide mt-1.5">
                  {s.label}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Conteúdo recente */}
      <section className="card-app p-4">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="font-display font-bold text-base text-slate-900">
            Os meus últimos conteúdos
          </h2>
          <Link
            to="/researcher/conteudos"
            className="text-xs font-semibold text-violet-700 hover:text-violet-900 transition-colors"
          >
            Ver tudo
          </Link>
        </div>
        {loading ? (
          <div className="py-6 flex justify-center">
            <Spinner />
          </div>
        ) : recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Ainda não tens conteúdos publicados.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((a) => {
              const st = statusMeta[a.status as keyof typeof statusMeta] ?? {
                label: a.status,
                cls: "bg-slate-100 text-slate-600",
              };
              return (
                <Link
                  key={a.id}
                  to={`/researcher/conteudos/${a.id}`}
                  className="group flex items-center gap-3 py-3 hover:bg-slate-50 -mx-1 px-1 rounded-md transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {a.category}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${st.cls}`}>
                        {st.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm leading-snug truncate text-slate-800">
                      {a.title}
                    </h3>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono-accent flex items-center gap-1 shrink-0">
                    <Eye size={11} />
                    {a.views ?? 0}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono-accent shrink-0">
                    {a.articleDate}
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Acções rápidas */}
      <section>
        <h2 className="font-display font-bold text-lg text-slate-900 mb-3">Acções rápidas</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            to="/researcher/publicar-artigo"
            className="card-app p-5 flex items-center gap-4 hover:border-violet-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-50 grid place-items-center text-violet-700 shrink-0">
              <PenLine size={18} strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold text-sm text-slate-900">
                Publicar artigo
              </div>
              <div className="text-xs text-muted-foreground">
                Submete um novo artigo para revisão
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300 shrink-0" />
          </Link>
          <Link
            to="/researcher/criar-debate"
            className="card-app p-5 flex items-center gap-4 hover:border-violet-200 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-50 grid place-items-center text-violet-700 shrink-0">
              <MessageSquare size={18} strokeWidth={1.8} />
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold text-sm text-slate-900">Criar debate</div>
              <div className="text-xs text-muted-foreground">Abre uma nova discussão pública</div>
            </div>
            <ChevronRight size={16} className="text-slate-300 shrink-0" />
          </Link>
        </div>
      </section>

      {/* Dicas editoriais */}
      <section className="card-app p-4 flex gap-3 border-l-2 border-l-amber-300">
        <Lightbulb size={16} className="text-amber-600 shrink-0 mt-0.5" strokeWidth={1.8} />
        <div className="space-y-1.5">
          <h3 className="font-display font-semibold text-sm text-slate-900">Lembra-te</h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside marker:text-amber-500">
            <li>Artigos sem referências são classificados como Opinião.</li>
            <li>Conteúdos em revisão são avaliados em até 48 horas.</li>
            <li>Usa os 3 níveis de explicação para chegar a mais leitores.</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
