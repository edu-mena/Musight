import { useState, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, X, ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/apiClient";
import { CATEGORIES } from "../../data/researcherData";

type Stance = "favor" | "neutro" | "contra";

const stances: { id: Stance; label: string; icon: typeof ThumbsUp; cls: string; active: string }[] = [
  { id: "favor", label: "A Favor", icon: ThumbsUp,
    cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
    active: "bg-emerald-100 border-emerald-500 ring-2 ring-emerald-500" },
  { id: "neutro", label: "Neutro", icon: Minus,
    cls: "bg-muted border-border text-foreground",
    active: "bg-slate-100 border-slate-700 ring-2 ring-slate-700" },
  { id: "contra", label: "Contra", icon: ThumbsDown,
    cls: "bg-red-50 border-red-200 text-red-700",
    active: "bg-red-100 border-red-500 ring-2 ring-red-500" },
];

export const PublishDebate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [summary, setSummary] = useState("");
  const [stance, setStance] = useState<Stance>("neutro");
  const [argument, setArgument] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim() && summary.trim() && argument.trim();

  const addTag = () => {
    const v = tagInput.trim();
    if (!v || tags.length >= 3 || tags.includes(v)) return;
    setTags((xs) => [...xs, v]);
    setTagInput("");
  };

  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await api.post("/researcher/debates", {
        title: title.trim(),
        category,
        summary: summary.trim(),
        stance,
        initial_argument: argument.trim(),
        expert_tags: tags,
      });
      toast.success("Debate submetido para revisão!");
      navigate("/researcher/conteudos");
    } catch (e) {
      toast.error((e as Error).message ?? "Erro ao criar debate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 h-14 px-4 flex items-center gap-2 border-b border-border bg-white/95 backdrop-blur-sm">
        <Link to="/researcher/conteudos" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft size={18} /> Voltar
        </Link>
        <h1 className="flex-1 text-center font-display font-bold text-base">Criar Debate</h1>
        <div className="w-16" />
      </header>

      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-mono-accent text-muted-foreground uppercase tracking-wide">Título do debate</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Uma questão clara e provocadora para o debate..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-white font-display font-semibold text-base focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono-accent text-muted-foreground uppercase tracking-wide">Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono-accent text-muted-foreground uppercase tracking-wide">Resumo</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value.slice(0, 300))} rows={4}
            placeholder="Contextualiza o debate. O que está em causa? Qual é o dilema?"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <div className="text-[10px] text-muted-foreground font-mono-accent text-right">{summary.length}/300</div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono-accent text-muted-foreground uppercase tracking-wide">A tua posição inicial</label>
          <div className="grid grid-cols-3 gap-2">
            {stances.map((s) => {
              const Icon = s.icon;
              const isActive = stance === s.id;
              return (
                <button key={s.id} type="button" onClick={() => setStance(s.id)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isActive ? s.active : s.cls + " hover:opacity-80"}`}>
                  <Icon size={22} strokeWidth={1.8} />
                  <span className="font-display font-semibold text-sm">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono-accent text-muted-foreground uppercase tracking-wide">Argumento inicial</label>
          <textarea value={argument} onChange={(e) => setArgument(e.target.value)} rows={4}
            placeholder="Escreve o teu argumento inicial para abrir o debate..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono-accent text-muted-foreground uppercase tracking-wide">
            Especialistas a convidar <span className="normal-case text-muted-foreground/60">(opcional · máx 3)</span>
          </label>
          <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-border bg-white min-h-12">
            {tags.map((t) => (
              <span key={t} className="pill bg-violet-100 text-violet-700 flex items-center gap-1">
                {t}
                <button onClick={() => setTags((xs) => xs.filter((x) => x !== t))} className="hover:text-violet-900"><X size={12} /></button>
              </span>
            ))}
            {tags.length < 3 && (
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={onTagKey}
                placeholder={tags.length === 0 ? "Escreve nome e pressiona Enter" : ""}
                className="flex-1 min-w-32 px-2 py-1 text-sm bg-transparent focus:outline-none" />
            )}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={!canSubmit || submitting} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? "A criar…" : "Publicar debate"}
        </button>
      </div>
    </div>
  );
};
