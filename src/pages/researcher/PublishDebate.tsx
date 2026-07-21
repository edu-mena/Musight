import { useState, type KeyboardEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, X, ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/apiClient";
import { CATEGORIES, type Category } from "../../lib/constants/categories";
import { debateSchema } from "../../lib/validation/content";

type Stance = "favor" | "neutro" | "contra";

const EXPLANATION_LIMIT = 1000;

const stances: { id: Stance; label: string; icon: typeof ThumbsUp }[] = [
  { id: "favor", label: "A favor", icon: ThumbsUp },
  { id: "neutro", label: "Neutro", icon: Minus },
  { id: "contra", label: "Contra", icon: ThumbsDown },
];

const stanceActiveCls: Record<Stance, string> = {
  favor: "border-emerald-500 bg-emerald-50 text-emerald-700",
  neutro: "border-slate-700 bg-slate-100 text-slate-800",
  contra: "border-red-500 bg-red-50 text-red-700",
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card-app p-5 space-y-4">
      <div>
        <h2 className="font-display font-semibold text-sm text-slate-900">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-mono-accent text-muted-foreground uppercase tracking-wide">
        {label}
        {hint && <span className="normal-case text-muted-foreground/60"> {hint}</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export const PublishDebate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [summary, setSummary] = useState("");
  const [stance, setStance] = useState<Stance>("neutro");
  const [argument, setArgument] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const canSubmit = title.trim() && summary.trim() && argument.trim();

  const addTag = () => {
    const v = tagInput.trim();
    if (!v || tags.length >= 3 || tags.includes(v)) return;
    setTags((xs) => [...xs, v]);
    setTagInput("");
  };

  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const result = debateSchema.safeParse({
      title,
      category,
      summary,
      stance,
      argument,
      tags,
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) errors[issue.path.join(".")] = issue.message;
      setFieldErrors(errors);
      toast.error(result.error.issues[0].message);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.post("/researcher/debates", {
        title: result.data.title.trim(),
        category: result.data.category,
        summary: result.data.summary.trim(),
        stance: result.data.stance,
        initialArgument: result.data.argument.trim(),
        invitedExperts: result.data.tags,
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
    <div className="pb-8 bg-slate-50/50 min-h-screen">
      <header className="sticky top-0 z-20 h-14 px-4 flex items-center gap-2 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <Link
          to="/researcher/conteudos"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={18} /> Voltar
        </Link>
        <h1 className="flex-1 text-center font-display font-bold text-base text-slate-900">
          Criar Debate
        </h1>
        <div className="w-16" />
      </header>

      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-4">
        <FormSection title="Identificação" description="Como o debate vai aparecer na plataforma.">
          <Field label="Título do debate" error={fieldErrors.title}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Uma questão clara e provocadora para o debate..."
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white font-display font-semibold text-base text-slate-900 placeholder:font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300"
            />
          </Field>

          <Field label="Categoria">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </FormSection>

        <FormSection
          title="Resumo"
          description="Contextualiza o debate: o que está em causa, qual é o dilema."
        >
          <Field label="Resumo" error={fieldErrors.summary}>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value.slice(0, EXPLANATION_LIMIT))}
              rows={6}
              placeholder="Contextualiza o debate. O que está em causa? Qual é o dilema?"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 resize-none focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300"
            />
            <div className="text-[10px] text-muted-foreground font-mono-accent text-right">
              {summary.length}/{EXPLANATION_LIMIT}
            </div>
          </Field>
        </FormSection>

        <FormSection
          title="Posição e argumento"
          description="Define o teu ponto de partida para abrir a discussão."
        >
          <Field label="A tua posição inicial">
            <div className="grid grid-cols-3 gap-2">
              {stances.map((s) => {
                const Icon = s.icon;
                const isActive = stance === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStance(s.id)}
                    className={`py-3 rounded-lg border transition-colors flex flex-col items-center gap-1.5 ${
                      isActive
                        ? stanceActiveCls[s.id]
                        : "border-slate-200 text-muted-foreground hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span className="font-display font-semibold text-xs">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Argumento inicial" error={fieldErrors.argument}>
            <textarea
              value={argument}
              onChange={(e) => setArgument(e.target.value.slice(0, EXPLANATION_LIMIT))}
              rows={6}
              placeholder="Escreve o teu argumento inicial para abrir o debate..."
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 resize-none focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300"
            />
            <div className="text-[10px] text-muted-foreground font-mono-accent text-right">
              {argument.length}/{EXPLANATION_LIMIT}
            </div>
          </Field>
        </FormSection>

        <FormSection
          title="Especialistas a convidar"
          description="Opcional, até 3 pessoas. Enriquecem o debate com contraditório directo."
        >
          <div className="flex flex-wrap gap-2 p-2.5 rounded-lg border border-slate-200 bg-white min-h-12">
            {tags.map((t) => (
              <span
                key={t}
                className="text-xs font-semibold px-2 py-1 rounded-md bg-violet-50 text-violet-700 flex items-center gap-1"
              >
                {t}
                <button
                  onClick={() => setTags((xs) => xs.filter((x) => x !== t))}
                  className="hover:text-violet-900"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {tags.length < 3 && (
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={onTagKey}
                placeholder={tags.length === 0 ? "Escreve o nome e pressiona Enter" : ""}
                className="flex-1 min-w-32 px-2 py-1 text-sm bg-transparent focus:outline-none"
              />
            )}
          </div>
        </FormSection>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "A criar…" : "Publicar debate"}
        </button>
      </div>
    </div>
  );
};
