import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, MessageSquare, Users, MessageSquareQuote, Edit2, ExternalLink, Trash2, FileX } from "lucide-react";
import { api, type ApiArticle, type ApiDebate } from "../../lib/apiClient";
import { statusMeta } from "../../data/researcherData";
import { toast } from "sonner";

type TypeFilter = "todos" | "artigos" | "debates";
type StatusFilter = "todos" | "publicado" | "rascunho" | "em_revisao" | "recusado";

const typeFilters: { id: TypeFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "artigos", label: "Artigos" },
  { id: "debates", label: "Debates" },
];

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "publicado", label: "Publicado" },
  { id: "rascunho", label: "Rascunho" },
  { id: "em_revisao", label: "Em revisão" },
  { id: "recusado", label: "Recusado" },
];

function Spinner() {
  return <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto" />;
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className={`pill transition-colors whitespace-nowrap ${active ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground hover:bg-violet-50 hover:text-violet-700"}`}>
      {children}
    </button>
  );
}

function ActionRow({ id, kind, confirm, onConfirm, onCancel, onDelete }: {
  id: number; kind: "a" | "d"; confirm: boolean; onConfirm: () => void; onCancel: () => void; onDelete: () => void;
}) {
  const editPath = kind === "a" ? `/researcher/publicar-artigo?edit=${id}` : `/researcher/criar-debate?edit=${id}`;
  const viewPath = kind === "a" ? `/app/artigos/${id}` : `/app/debates/${id}`;
  if (confirm) {
    return (
      <div className="flex items-center gap-2 pt-2 border-t border-border mt-1">
        <span className="text-xs text-red-600 flex-1">Confirmar eliminação?</span>
        <button onClick={onCancel} className="text-xs font-semibold text-muted-foreground px-2 py-1">Cancelar</button>
        <button onClick={onDelete} className="text-xs font-semibold text-white bg-red-600 px-3 py-1 rounded-lg">Eliminar</button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 pt-2 border-t border-border mt-1">
      <Link to={editPath} className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 flex items-center gap-1">
        <Edit2 size={12} /> Editar
      </Link>
      <Link to={viewPath} className="text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1 flex items-center gap-1">
        <ExternalLink size={12} /> Ver
      </Link>
      <button onClick={onConfirm} className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 flex items-center gap-1 ml-auto">
        <Trash2 size={12} /> Eliminar
      </button>
    </div>
  );
}

export const MyContent = () => {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [debates, setDebates] = useState<ApiDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeF, setTypeF] = useState<TypeFilter>("todos");
  const [statusF, setStatusF] = useState<StatusFilter>("todos");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<ApiArticle[]>("/researcher/articles"),
      api.get<ApiDebate[]>("/researcher/debates"),
    ])
      .then(([a, d]) => { setArticles(a); setDebates(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filterStatus = <T extends { status: string }>(list: T[]) =>
    statusF === "todos" ? list : list.filter((x) => x.status === statusF);

  const showArticles = typeF === "todos" || typeF === "artigos";
  const showDebates = typeF === "todos" || typeF === "debates";
  const visibleArticles = showArticles ? filterStatus(articles) : [];
  const visibleDebates = showDebates ? filterStatus(debates) : [];
  const isEmpty = visibleArticles.length === 0 && visibleDebates.length === 0;

  const deleteArticle = async (id: number) => {
    try {
      await api.delete(`/researcher/articles/${id}`);
      setArticles((xs) => xs.filter((x) => x.id !== id));
      toast("Artigo eliminado.");
    } catch { toast.error("Erro ao eliminar artigo."); }
    setConfirmDelete(null);
  };

  const deleteDebate = async (id: number) => {
    try {
      await api.delete(`/researcher/debates/${id}`);
      setDebates((xs) => xs.filter((x) => x.id !== id));
      toast("Debate eliminado.");
    } catch { toast.error("Erro ao eliminar debate."); }
    setConfirmDelete(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-4">
      <header>
        <h1 className="font-display font-bold text-2xl md:text-3xl">Os meus conteúdos</h1>
        <p className="text-sm text-muted-foreground">Gere os teus artigos e debates.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {typeFilters.map((f) => (
          <FilterPill key={f.id} active={typeF === f.id} onClick={() => setTypeF(f.id)}>{f.label}</FilterPill>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {statusFilters.map((f) => (
          <FilterPill key={f.id} active={statusF === f.id} onClick={() => setStatusF(f.id)}>{f.label}</FilterPill>
        ))}
      </div>

      {loading ? (
        <div className="card-app p-6 flex justify-center"><Spinner /></div>
      ) : isEmpty ? (
        <div className="card-app p-10 flex flex-col items-center text-center gap-3">
          <FileX size={36} className="text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">Ainda não tens conteúdos nesta categoria.</p>
          <Link to="/researcher/publicar-artigo" className="btn-primary">Publicar o primeiro artigo</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleArticles.map((a) => {
            const st = statusMeta[a.status as keyof typeof statusMeta] ?? { label: a.status, cls: "bg-muted text-muted-foreground" };
            return (
              <article key={a.id} className="card-app p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="pill bg-primary/10 text-primary">{a.category}</span>
                    <span className={`pill ${st.cls}`}>{st.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono-accent shrink-0">{a.date}</span>
                </div>
                <h3 className="font-display font-semibold text-sm leading-snug">{a.title}</h3>
                {a.excerpt && <p className="text-xs text-muted-foreground line-clamp-1">{a.excerpt}</p>}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono-accent">
                  <span className="flex items-center gap-1"><Eye size={11} />{a.views ?? 0}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={11} />{a.comment_count ?? 0}</span>
                  {!a.has_references && (
                    <span className="pill bg-amber-100 text-amber-700 flex items-center gap-0.5">
                      <MessageSquareQuote size={10} /> Opinião
                    </span>
                  )}
                </div>
                <ActionRow id={a.id} kind="a"
                  confirm={confirmDelete === a.id}
                  onConfirm={() => setConfirmDelete(a.id)}
                  onCancel={() => setConfirmDelete(null)}
                  onDelete={() => deleteArticle(a.id)} />
              </article>
            );
          })}
          {visibleDebates.map((d) => {
            const st = statusMeta[d.status as keyof typeof statusMeta] ?? { label: d.status, cls: "bg-muted text-muted-foreground" };
            return (
              <article key={d.id} className="card-app p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="pill bg-violet-100 text-violet-700">Debate</span>
                    <span className="pill bg-primary/10 text-primary">{d.category}</span>
                    <span className={`pill ${st.cls}`}>{st.label}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono-accent shrink-0">{d.date}</span>
                </div>
                <h3 className="font-display font-semibold text-sm leading-snug">{d.title}</h3>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono-accent">
                  <span className="flex items-center gap-1"><Users size={11} />{d.participants}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={11} />{d.comment_count ?? 0}</span>
                </div>
                <ActionRow id={d.id} kind="d"
                  confirm={confirmDelete === d.id}
                  onConfirm={() => setConfirmDelete(d.id)}
                  onCancel={() => setConfirmDelete(null)}
                  onDelete={() => deleteDebate(d.id)} />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
