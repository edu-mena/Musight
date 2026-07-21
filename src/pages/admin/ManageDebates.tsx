import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { api, type ApiDebate, type Paginated } from "../../lib/apiClient";

type StatusFilter = "todos" | "em_revisao" | "publicado" | "recusado";

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "em_revisao", label: "Em revisão" },
  { id: "publicado", label: "Publicado" },
  { id: "recusado", label: "Recusado" },
];

const statusPill: Record<string, string> = {
  em_revisao: "bg-sky-50 text-sky-700",
  publicado: "bg-emerald-50 text-emerald-700",
  recusado: "bg-red-50 text-red-700",
};

const statusLabel: Record<string, string> = {
  em_revisao: "Em revisão",
  publicado: "Publicado",
  recusado: "Recusado",
};

function Spinner() {
  return (
    <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin mx-auto" />
  );
}

export const ManageDebates = () => {
  const [items, setItems] = useState<ApiDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusF, setStatusF] = useState<StatusFilter>("todos");
  const [activeReject, setActiveReject] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    api
      .get<Paginated<ApiDebate>>("/admin/debates")
      .then((res) => setItems(res.debates ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = statusF === "todos" ? items : items.filter((i) => i.status === statusF);

  const approve = async (id: number) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "publicado" } : x)));
    try {
      await api.put(`/admin/debates/${id}/approve`, {});
      toast.success("Debate aprovado e publicado.");
    } catch {
      setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: "em_revisao" } : x)));
      toast.error("Erro ao aprovar.");
    }
  };

  const reject = async (id: number) => {
    if (!rejectReason.trim()) return;
    const reason = rejectReason;
    setItems((xs) =>
      xs.map((x) => (x.id === id ? { ...x, status: "recusado", rejectionReason: reason } : x)),
    );
    try {
      await api.put(`/admin/debates/${id}/reject`, { reason });
      toast("Debate rejeitado.", { description: "O autor será notificado." });
    } catch {
      setItems((xs) =>
        xs.map((x) => (x.id === id ? { ...x, status: "em_revisao", rejectionReason: null } : x)),
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

  const counts = statusFilters.reduce<Record<string, number>>((acc, f) => {
    acc[f.id] = f.id === "todos" ? items.length : items.filter((i) => i.status === f.id).length;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5">
      <header className="space-y-1">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900">Debates</h1>
        <p className="text-sm text-muted-foreground">
          Revê e aprova propostas de debate dos pesquisadores.
        </p>
      </header>

      <div className="flex gap-1 border-b border-slate-200 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
        {statusFilters.map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusF(f.id)}
            className={`relative px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
              statusF === f.id ? "text-slate-900" : "text-muted-foreground hover:text-slate-700"
            }`}
          >
            {f.label}
            <span className="ml-1.5 font-mono-accent text-[10px] text-slate-400">
              {counts[f.id]}
            </span>
            {statusF === f.id && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-slate-800 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card-app p-8 flex justify-center">
          <Spinner />
        </div>
      ) : visible.length === 0 ? (
        <div className="card-app p-10 text-center text-sm text-muted-foreground">
          Sem debates nesta categoria.
        </div>
      ) : (
        <div className="card-app divide-y divide-slate-100">
          {visible.map((d) => {
            const isRejecting = activeReject === d.id;
            return (
              <article key={d.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-50 text-violet-700">
                      Debate
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {d.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusPill[d.status] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {statusLabel[d.status] ?? d.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono-accent shrink-0">
                    {d.debateDate}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-sm leading-snug text-slate-900">
                  {d.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-3">{d.summary}</p>
                <p className="text-[11px] text-muted-foreground font-mono-accent">
                  Por <span className="font-semibold text-foreground">{d.authorId}</span> ·
                  Pesquisador ✓
                </p>

                {d.status === "em_revisao" &&
                  (isRejecting ? (
                    <div className="p-3 rounded-lg border border-red-200 bg-red-50/60 space-y-2">
                      <p className="text-xs font-semibold text-red-700">Motivo da rejeição</p>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={2}
                        placeholder="Explica o motivo ao autor..."
                        className="w-full px-3 py-2 rounded-lg border border-border text-sm resize-none focus:outline-none focus:ring-1 focus:ring-red-300 bg-white"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelReject}
                          className="text-xs font-semibold text-muted-foreground px-3 py-1.5 hover:text-slate-700 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => reject(d.id)}
                          disabled={!rejectReason.trim()}
                          className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg disabled:opacity-40 transition-colors"
                        >
                          Confirmar rejeição
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 pt-2.5 border-t border-slate-100">
                      <button
                        onClick={() => approve(d.id)}
                        className="flex-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 border border-transparent hover:border-emerald-200"
                      >
                        <Check size={13} /> Aprovar
                      </button>
                      <button
                        onClick={() => {
                          setActiveReject(d.id);
                          setRejectReason("");
                        }}
                        className="flex-1 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 border border-transparent hover:border-red-200"
                      >
                        <X size={13} /> Rejeitar
                      </button>
                    </div>
                  ))}

                {d.status === "recusado" && d.rejectionReason && (
                  <div className="pl-3 border-l-2 border-red-200">
                    <p className="text-[11px] text-red-700">
                      <span className="font-semibold">Motivo: </span>
                      {d.rejectionReason}
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
