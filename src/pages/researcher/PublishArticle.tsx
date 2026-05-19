import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronUp, X, Plus, Info } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/apiClient";
import { CATEGORIES } from "../../data/researcherData";

type Level = "basico" | "intermedio" | "avancado";

const tabs: { id: Level; label: string; subtitle: string; cls: string; placeholder: string }[] = [
  { id: "basico", label: "Básico", subtitle: "Para o Cidadão", cls: "from-emerald-400 to-emerald-600",
    placeholder: "Explica de forma simples, como se fosse a um familiar. Evita jargões." },
  { id: "intermedio", label: "Intermédio", subtitle: "Visão Prática", cls: "from-amber-400 to-orange-500",
    placeholder: "Para quem quer entender o contexto e as implicações práticas." },
  { id: "avancado", label: "Avançado", subtitle: "Análise Técnica", cls: "from-violet-500 to-purple-700",
    placeholder: "Análise técnica para profissionais e especialistas da área." },
];

function Section({ title, open, onToggle, children }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="card-app overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between p-4">
        <span className="font-display font-semibold">{title}</span>
        {open ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
      </button>
      {open && <div className="p-4 pt-0 space-y-3">{children}</div>}
    </div>
  );
}

export const PublishArticle = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [openSec, setOpenSec] = useState({ s1: true, s2: true, s3: false, s4: false });
  const toggle = (k: keyof typeof openSec) => setOpenSec((s) => ({ ...s, [k]: !s[k] }));

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState("");
  const [date, setDate] = useState(today);

  const [activeTab, setActiveTab] = useState<Level>("basico");
  const [content, setContent] = useState<Record<Level, string>>({ basico: "", intermedio: "", avancado: "" });

  const [terms, setTerms] = useState<{ term: string; definition: string }[]>([]);
  const [showTermForm, setShowTermForm] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: "", definition: "" });

  const [refs, setRefs] = useState<{ label: string; url: string }[]>([]);
  const [showRefForm, setShowRefForm] = useState(false);
  const [newRef, setNewRef] = useState({ label: "", url: "" });

  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length > 0 && content.basico.trim().length > 0;

  const buildFormData = (isDraft: boolean) => {
    const form = new FormData();
    form.append("title", title);
    form.append("category", category);
    form.append("excerpt", excerpt);
    form.append("date", date);
    form.append("content_basico", content.basico);
    form.append("content_intermedio", content.intermedio);
    form.append("content_avancado", content.avancado);
    form.append("key_terms", JSON.stringify(terms));
    form.append("references", JSON.stringify(refs));
    form.append("status", isDraft ? "rascunho" : "em_revisao");
    return form;
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await api.postForm("/researcher/articles", buildFormData(false));
      toast.success("Artigo submetido!", { description: "A equipa editorial irá rever em até 48 horas." });
      navigate("/researcher/conteudos");
    } catch (e) {
      toast.error((e as Error).message ?? "Erro ao submeter artigo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraft = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.postForm("/researcher/articles", buildFormData(true));
      toast("Rascunho guardado.");
      navigate("/researcher/conteudos");
    } catch (e) {
      toast.error((e as Error).message ?? "Erro ao guardar rascunho.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-20 h-14 px-4 flex items-center gap-2 border-b border-border bg-white/95 backdrop-blur-sm">
        <Link to="/researcher/conteudos" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft size={18} /> Voltar
        </Link>
        <h1 className="flex-1 text-center font-display font-bold text-base truncate">Publicar Artigo</h1>
        <button onClick={handleDraft} disabled={!title.trim() || submitting} className="text-xs font-semibold text-violet-700 hover:underline px-2 disabled:opacity-40">
          Guardar rascunho
        </button>
      </header>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4">
        <Section title="1. Informação básica" open={openSec.s1} onToggle={() => toggle("s1")}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do artigo..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-white font-display font-semibold text-base focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value.slice(0, 200))}
              placeholder="Resumo curto do artigo (máx 200 caracteres)..." rows={2}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <div className="text-[10px] text-muted-foreground font-mono-accent text-right mt-1">{excerpt.length}/200</div>
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        </Section>

        <Section title="2. Conteúdo por nível" open={openSec.s2} onToggle={() => toggle("s2")}>
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setActiveTab(t.id)}
                  className={`p-3 rounded-xl text-left transition-all ${active ? `bg-gradient-to-br ${t.cls} text-white shadow-md` : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                  <div className="font-display font-semibold text-sm">{t.label}</div>
                  <div className="text-[10px] font-mono-accent opacity-80">{t.subtitle}</div>
                </button>
              );
            })}
          </div>
          {tabs.map((t) => activeTab === t.id && (
            <div key={t.id}>
              <textarea value={content[t.id]} onChange={(e) => setContent((c) => ({ ...c, [t.id]: e.target.value }))}
                placeholder={t.placeholder} rows={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <div className="text-[10px] text-muted-foreground font-mono-accent text-right mt-1">{content[t.id].length} caracteres</div>
            </div>
          ))}
        </Section>

        <Section title="3. Glossário de termos-chave" open={openSec.s3} onToggle={() => toggle("s3")}>
          {terms.length > 0 && (
            <ul className="space-y-2">
              {terms.map((t, i) => (
                <li key={i} className="flex items-start gap-2 p-3 rounded-xl bg-muted">
                  <div className="flex-1 text-sm">
                    <span className="font-semibold">{t.term}</span>
                    <span className="text-muted-foreground"> — {t.definition.slice(0, 80)}{t.definition.length > 80 ? "…" : ""}</span>
                  </div>
                  <button onClick={() => setTerms((xs) => xs.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-600">
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showTermForm ? (
            <div className="space-y-2 p-3 rounded-xl border border-border">
              <input value={newTerm.term} onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                placeholder="Termo" className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
              <input value={newTerm.definition} onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
                placeholder="Definição" className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowTermForm(false); setNewTerm({ term: "", definition: "" }); }}
                  className="text-xs font-semibold text-muted-foreground px-3 py-1.5">Cancelar</button>
                <button onClick={() => { if (!newTerm.term.trim() || !newTerm.definition.trim()) return; setTerms((xs) => [...xs, newTerm]); setNewTerm({ term: "", definition: "" }); setShowTermForm(false); }}
                  className="text-xs font-semibold text-white bg-violet-600 px-3 py-1.5 rounded-lg">Adicionar</button>
              </div>
            </div>
          ) : terms.length < 8 && (
            <button onClick={() => setShowTermForm(true)} className="btn-ghost w-full flex items-center justify-center gap-1">
              <Plus size={16} /> Adicionar termo
            </button>
          )}
        </Section>

        <Section title="4. Referências bibliográficas" open={openSec.s4} onToggle={() => toggle("s4")}>
          <div className="flex gap-2 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>Artigos sem referências são classificados como <strong>Opinião</strong> e aparecem com badge específico para os leitores.</p>
          </div>
          {refs.length > 0 && (
            <ul className="space-y-2">
              {refs.map((r, i) => (
                <li key={i} className="flex items-start gap-2 p-3 rounded-xl bg-muted">
                  <div className="flex-1 text-sm min-w-0">
                    <div className="font-semibold truncate">{r.label}</div>
                    {r.url && <div className="text-xs text-muted-foreground truncate">{r.url}</div>}
                  </div>
                  <button onClick={() => setRefs((xs) => xs.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-600">
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showRefForm ? (
            <div className="space-y-2 p-3 rounded-xl border border-border">
              <input value={newRef.label} onChange={(e) => setNewRef({ ...newRef, label: e.target.value })}
                placeholder="Fonte / Título" className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
              <input value={newRef.url} onChange={(e) => setNewRef({ ...newRef, url: e.target.value })}
                placeholder="URL (opcional)" className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowRefForm(false); setNewRef({ label: "", url: "" }); }}
                  className="text-xs font-semibold text-muted-foreground px-3 py-1.5">Cancelar</button>
                <button onClick={() => { if (!newRef.label.trim()) return; setRefs((xs) => [...xs, newRef]); setNewRef({ label: "", url: "" }); setShowRefForm(false); }}
                  className="text-xs font-semibold text-white bg-violet-600 px-3 py-1.5 rounded-lg">Adicionar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowRefForm(true)} className="btn-ghost w-full flex items-center justify-center gap-1">
              <Plus size={16} /> Adicionar referência
            </button>
          )}
        </Section>
      </div>

      <footer className="fixed bottom-0 inset-x-0 md:left-60 z-20 border-t border-border bg-white/95 backdrop-blur-sm p-3 flex gap-2 mb-16 md:mb-0">
        <button onClick={handleDraft} disabled={submitting} className="btn-ghost flex-1">Guardar rascunho</button>
        <button onClick={handleSubmit} disabled={!canSubmit || submitting} className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? "A submeter…" : "Submeter para revisão"}
        </button>
      </footer>
    </div>
  );
};
