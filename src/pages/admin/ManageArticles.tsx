import { useState, useEffect } from "react";
import { Check, X, MessageSquareQuote } from "lucide-react";
import { toast } from "sonner";
import { api, type ApiArticle } from "../../lib/apiClient";

type StatusFilter = "todos" | "em_revisao" | "publicado" | "recusado";

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "em_revisao", label: "Em revisão" },
  { id: "publicado", label: "Publicado" },
  { id: "recusado", label: "Recusado" },
];

const statusPill: Record<string, string> = {
  em_revisao: "bg-sky-100 text-sky-700",
  publicado: "bg-emerald-100 text-emerald-700",
  recusado: "bg-red-100 text-red-700",
  rascunho: "bg-amber-100 text-amber-700",
};

const statusLabel: Record<string, string> = {
  em_revisao: "Em revisão",
  publicado: "Publicado",
  recusado: "Recusado",
  rascunho: "Rascunho",
};

function Spinner() {
  return (
    <div className="w-6 h-6 rounded-full border-2 border-slate-400 border-t-transparent animate-spin mx-auto" />
  );
}

export const ManageArticles = () => {
  const [items, setItems] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusF, setStatusF] = useState<StatusFilter>("todos");
  const [activeReject, setActiveReject] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    api
      .get<ApiArticle[]>("/admin/articles")
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = statusF === "todos" ? items : items.filter((i) => i.status === statusF);

  const approve = async (id: number) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "publicado" } : x)));
    try {
      await api.put(`/admin/articles/${id}/approve`, {});
      toast.success("Artigo aprovado e publicado.");
    } catch {
      setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "em_revisao" } : x)));
      toast.error("Erro ao aprovar.");
    }
  };

  const reject = async (id: number) => {
    if (!rejectReason.trim()) return;
    const reason = rejectReason;
    setItems((xs) =>
      xs.map((x) => (x.id === id ? { ...x, status: "recusado", rejection_reason: reason } : x)),
    );
    try {
      await api.put(`/admin/articles/${id}/reject`, { reason });
      toast("Artigo rejeitado.", { description: "O autor será notificado." });
    } catch {
      setItems((xs) =>
        xs.map((x) => (x.id === id ? { ...x, status: "em_revisao", rejection_reason: null } : x)),
      );
      toast.error("Erro ao rejeitar.");
    }
    setRejectReason("");
    setActiveReject(null);
  };

  const cancelReject = () => {
    setActiveReject(null);
    setRejectReason("");
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
      <header>
        <h1 className="font-display font-bold text-2xl md:text-3xl">Artigos</h1>
        <p className="text-sm text-muted-foreground">Revê e aprova submissões dos pesquisadores.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {statusFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusF(f.id)}
            className={`pill transition-colors whitespace-nowrap ${statusF === f.id ? "bg-slate-700 text-white" : "bg-muted text-muted-foreground hover:bg-slate-100 hover:text-slate-700"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card-app p-8 flex justify-center">
          <Spinner />
        </div>
      ) : visible.length === 0 ? (
        <div className="card-app p-10 text-center text-sm text-muted-foreground">
          Sem artigos nesta categoria.
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => {
            const isRejecting = activeReject === a.id;
            return (
              <article key={a.id} className="card-app p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="pill bg-primary/10 text-primary">{a.category}</span>
                    <span
                      className={`pill ${statusPill[a.status] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {statusLabel[a.status] ?? a.status}
                    </span>
                    {!a.has_references && (
                      <span className="pill bg-amber-100 text-amber-700 flex items-center gap-0.5">
                        <MessageSquareQuote size={10} /> Opinião
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono-accent shrink-0">
                    {a.date}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-sm leading-snug">{a.title}</h3>
                {a.excerpt && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.excerpt}</p>
                )}
                <p className="text-[11px] text-muted-foreground font-mono-accent">
                  Por <span className="font-semibold text-foreground">{a.author.name}</span> ·{" "}
                  {a.author.role === "researcher" ? "Pesquisador" : "Especialista"}
                  {a.author.verified && " ✓"}
                </p>

                {a.status === "em_revisao" &&
                  (isRejecting ? (
                    <div className="p-3 rounded-xl border border-red-200 bg-red-50 space-y-2">
                      <p className="text-xs font-semibold text-red-700">Motivo da rejeição</p>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        placeholder="Explica o motivo ao autor..."
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none focus:outline-none bg-white"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelReject}
                          className="text-xs font-semibold text-muted-foreground px-3 py-1.5"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => reject(a.id)}
                          disabled={!rejectReason.trim()}
                          className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2 border-t border-border mt-1">
                      <button
                        onClick={() => approve(a.id)}
                        className="flex-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Check size={13} /> Aprovar
                      </button>
                      <button
                        onClick={() => {
                          setActiveReject(a.id);
                          setRejectReason("");
                        }}
                        className="flex-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <X size={13} /> Rejeitar
                      </button>
                    </div>
                  ))}

                {a.status === "recusado" && a.rejection_reason && (
                  <div className="p-2 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-[11px] text-red-700">
                      <span className="font-semibold">Motivo: </span>
                      {a.rejection_reason}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
