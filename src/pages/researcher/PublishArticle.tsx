import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Info,
  Image as ImageIcon,
  Mic,
  Square,
  Upload,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Eraser,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../lib/apiClient";
import { CATEGORIES, type Category } from "../../lib/constants/categories";
import { articleSubmitSchema } from "../../lib/validation/content";

type Level = "basico" | "intermedio" | "avancado";
type AudioTab = "gravar" | "importar";

const MAX_IMAGE_MB = 5;
const MAX_AUDIO_MB = 25;
const LEVEL_CHAR_LIMIT = 1000;

// Rascunho é guardado apenas neste navegador (não vai para o backend).
const DRAFT_STORAGE_KEY = "girassol:article-draft";

type DraftPayload = {
  title: string;
  category: Category;
  excerpt: string;
  date: string;
  content: Record<Level, string>;
  terms: { term: string; definition: string }[];
  refs: { label: string; url: string }[];
  savedAt: string;
};

const tabs: {
  id: Level;
  label: string;
  subtitle: string;
  dot: string;
  placeholder: string;
}[] = [
  {
    id: "basico",
    label: "Básico",
    subtitle: "Para o Cidadão",
    dot: "bg-emerald-500",
    placeholder: "Explica de forma simples, como se fosse a um familiar. Evita jargões.",
  },
  {
    id: "intermedio",
    label: "Intermédio",
    subtitle: "Visão Prática",
    dot: "bg-amber-500",
    placeholder: "Para quem quer entender o contexto e as implicações práticas.",
  },
  {
    id: "avancado",
    label: "Avançado",
    subtitle: "Análise Técnica",
    dot: "bg-violet-500",
    placeholder: "Análise técnica para profissionais e especialistas da área.",
  },
];

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Comprimento em texto puro de um HTML (usado para validar o mínimo de
// conteúdo e não deixar o utilizador submeter só tags vazias).
function plainTextLength(html: string) {
  if (typeof document === "undefined") return html.trim().length;
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent ?? "").trim().length;
}

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={label}
      aria-label={label}
      className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
    >
      {children}
    </button>
  );
}

// Editor de texto formatado leve, sem dependências externas: contentEditable
// com uma barra de ferramentas mínima (negrito, itálico, sublinhado, listas,
// link). Não controlado pelo React a cada tecla — evita o cursor "saltar" em
// contentEditable — o HTML só é lido para fora via onChange.
function RichTextEditor({
  initialHtml,
  onChange,
  limit,
  placeholder,
}: {
  initialHtml: string;
  onChange: (html: string, length: number) => void;
  limit: number;
  placeholder: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [length, setLength] = useState(() => plainTextLength(initialHtml));

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readState = () => {
    const el = ref.current;
    if (!el) return;
    const text = el.textContent ?? "";
    setLength(text.length);
    onChange(el.innerHTML, text.length);
  };

  const exec = (cmd: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    readState();
  };

  const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
    const native = e.nativeEvent as InputEvent;
    const el = ref.current;
    if (!el) return;
    const currentLength = el.textContent?.length ?? 0;
    if (native.inputType?.startsWith("insert") && currentLength >= limit) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = ref.current;
    if (!el) return;
    const currentLength = el.textContent?.length ?? 0;
    const remaining = limit - currentLength;
    if (remaining <= 0) return;
    const text = e.clipboardData.getData("text/plain").slice(0, remaining);
    document.execCommand("insertText", false, text);
    readState();
  };

  const addLink = () => {
    const url = window.prompt("URL do link:");
    if (url) exec("createLink", url);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:ring-1 focus-within:ring-violet-300 focus-within:border-violet-300">
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50">
        <ToolbarButton onClick={() => exec("bold")} label="Negrito">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} label="Itálico">
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} label="Sublinhado">
          <Underline size={14} />
        </ToolbarButton>
        <span className="w-px h-4 bg-slate-200 mx-1" />
        <ToolbarButton onClick={() => exec("insertUnorderedList")} label="Lista">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} label="Lista numerada">
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={addLink} label="Adicionar link">
          <Link2 size={14} />
        </ToolbarButton>
        <span className="w-px h-4 bg-slate-200 mx-1" />
        <ToolbarButton onClick={() => exec("removeFormat")} label="Limpar formatação">
          <Eraser size={14} />
        </ToolbarButton>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={readState}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        className="rich-editor px-4 py-3 text-sm text-slate-800 leading-relaxed min-h-[150px] focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-violet-700 [&_a]:underline"
      />
      <div
        className={`flex justify-end px-3 py-1.5 border-t border-slate-100 text-[10px] font-mono-accent ${
          length >= limit ? "text-red-600" : "text-muted-foreground"
        }`}
      >
        {length}/{limit}
      </div>
    </div>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="card-app overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4"
      >
        <span className="font-display font-semibold text-slate-900">{title}</span>
        {open ? (
          <ChevronUp size={18} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={18} className="text-muted-foreground" />
        )}
      </button>
      {open && <div className="p-4 pt-0 space-y-3">{children}</div>}
    </div>
  );
}

export const PublishArticle = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [openSec, setOpenSec] = useState({ s1: true, s2: true, s3: false, s4: false, s5: true });
  const toggle = (k: keyof typeof openSec) => setOpenSec((s) => ({ ...s, [k]: !s[k] }));

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState("");
  const [date, setDate] = useState(today);

  const [activeTab, setActiveTab] = useState<Level>("basico");
  const [content, setContent] = useState<Record<Level, string>>({
    basico: "",
    intermedio: "",
    avancado: "",
  });
  const [contentLength, setContentLength] = useState<Record<Level, number>>({
    basico: 0,
    intermedio: 0,
    avancado: 0,
  });

  const [terms, setTerms] = useState<{ term: string; definition: string }[]>([]);
  const [showTermForm, setShowTermForm] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: "", definition: "" });

  const [refs, setRefs] = useState<{ label: string; url: string }[]>([]);
  const [showRefForm, setShowRefForm] = useState(false);
  const [newRef, setNewRef] = useState({ label: "", url: "" });

  // ── Imagem de capa ──────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Áudio: gravado ou importado, com duração calculada no cliente ──────
  const [audioTab, setAudioTab] = useState<AudioTab>("gravar");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [audioDurationLabel, setAudioDurationLabel] = useState<string | null>(null);
  // Segundos "crus" (inteiro) — é isto que vai para o backend, não o label formatado "3:45".
  const [audioDurationSeconds, setAudioDurationSeconds] = useState<number | null>(null);
  const [audioSourceLabel, setAudioSourceLabel] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const canSubmit = title.trim().length > 0 && contentLength.basico > 0;

  // Ao montar, avisa se existir um rascunho guardado neste navegador.
  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return;

    try {
      const draft: DraftPayload = JSON.parse(raw);
      toast("Encontrámos um rascunho guardado neste navegador.", {
        description: draft.savedAt
          ? `Guardado em ${new Date(draft.savedAt).toLocaleString("pt-PT")}`
          : undefined,
        action: {
          label: "Restaurar",
          onClick: () => {
            setTitle(draft.title ?? "");
            setCategory(draft.category ?? CATEGORIES[0]);
            setExcerpt(draft.excerpt ?? "");
            setDate(draft.date ?? today);
            const restored = draft.content ?? { basico: "", intermedio: "", avancado: "" };
            setContent(restored);
            setContentLength({
              basico: plainTextLength(restored.basico ?? ""),
              intermedio: plainTextLength(restored.intermedio ?? ""),
              avancado: plainTextLength(restored.avancado ?? ""),
            });
            setTerms(draft.terms ?? []);
            setRefs(draft.refs ?? []);
            toast.success("Rascunho restaurado. Lembra-te de reanexar imagem/áudio, se tinhas.");
          },
        },
      });
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Liberta object URLs e o microfone ao trocar de ficheiro/desmontar.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, [audioPreview]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Escolhe um ficheiro de imagem válido.");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`A imagem não pode exceder ${MAX_IMAGE_MB}MB.`);
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const applyAudioResult = (file: File, source: string) => {
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioPreview(url);
    setAudioSourceLabel(source);

    // Lê a duração real do ficheiro. Guardamos o label (exibição) e os segundos
    // inteiros (o que realmente vai no FormData para o backend).
    const probe = new Audio(url);
    probe.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(probe.duration)) {
        setAudioDurationLabel(formatDuration(probe.duration));
        setAudioDurationSeconds(Math.round(probe.duration));
      }
    });
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Escolhe um ficheiro de áudio válido.");
      return;
    }
    if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
      toast.error(`O áudio não pode exceder ${MAX_AUDIO_MB}MB.`);
      return;
    }
    applyAudioResult(file, file.name);
  };

  const removeAudio = () => {
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioFile(null);
    setAudioPreview(null);
    setAudioDurationLabel(null);
    setAudioDurationSeconds(null);
    setAudioSourceLabel(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      recordedChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const ext = mimeType.includes("mp4") ? "m4a" : "webm";
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const file = new File([blob], `gravacao-${Date.now()}.${ext}`, { type: mimeType });
        applyAudioResult(file, "Gravação");
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Não foi possível aceder ao microfone. Verifica as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const buildFormData = () => {
    const form = new FormData();
    form.append("title", title);
    form.append("category", category);
    form.append("excerpt", excerpt);
    form.append("articleDate", date);
    form.append(
      "levels",
      JSON.stringify(
        [
          {
            level: "basico",
            label: "Básico",
            sublabel: "Introdução ao tema",
            content: content.basico,
          },
          {
            level: "intermedio",
            label: "Intermédio",
            sublabel: "Visão prática",
            content: content.intermedio,
          },
          {
            level: "avancado",
            label: "Avançado",
            sublabel: "Análise técnica",
            content: content.avancado,
          },
        ].filter((item) => plainTextLength(item.content) > 0),
      ),
    );
    form.append("keyTerms", JSON.stringify(terms));
    form.append("references", JSON.stringify(refs));

    // Nomes de campo alinhados com o multer do backend: "image" e "audio".
    if (imageFile) form.append("image", imageFile);
    if (audioFile) {
      form.append("audio", audioFile);
      // Envia segundos inteiros (ex: "225"), nunca o label "3:45" — o backend
      // faz Number(audioDuration) e grava num campo numérico.
      if (audioDurationSeconds != null) {
        form.append("audioDuration", String(audioDurationSeconds));
      }
    }

    return form;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const result = articleSubmitSchema.safeParse({
      title,
      category,
      excerpt,
      date,
      content,
      terms,
      refs,
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
      await api.postForm("/researcher/articles", buildFormData());
      // Submissão feita com sucesso: o rascunho local deixa de fazer sentido.
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      toast.success("Artigo submetido!", {
        description: "A equipa editorial irá rever em até 48 horas.",
      });
      navigate("/researcher/conteudos");
    } catch (e) {
      toast.error((e as Error).message ?? "Erro ao submeter artigo.");
    } finally {
      setSubmitting(false);
    }
  };

  // Rascunho: guardado apenas no navegador (localStorage), sem chamar o backend.
  // Imagem e áudio NÃO são incluídos — ficheiros binários não cabem/não devem
  // ir para localStorage. Só texto (título, categoria, resumo, conteúdo, etc).
  const handleDraft = () => {
    if (!title.trim()) {
      toast.error("Adiciona pelo menos um título antes de guardar o rascunho.");
      return;
    }

    const draft: DraftPayload = {
      title,
      category,
      excerpt,
      date,
      content,
      terms,
      refs,
      savedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      toast("Rascunho guardado neste navegador.", {
        description: "Imagem e áudio não ficam guardados no rascunho — só o texto.",
      });
    } catch {
      toast.error("Não foi possível guardar o rascunho (armazenamento cheio ou bloqueado).");
    }
  };

  return (
    <div className="pb-32">
      {/* Placeholder do editor de texto formatado (contentEditable não suporta
          placeholder nativo). */}
      <style>{`
        .rich-editor:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>

      <header className="sticky top-0 z-20 h-14 px-4 flex items-center gap-2 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <Link
          to="/researcher/conteudos"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-slate-800 transition-colors"
        >
          <ChevronLeft size={18} /> Voltar
        </Link>
        <h1 className="flex-1 text-center font-display font-bold text-base text-slate-900 truncate">
          Publicar Artigo
        </h1>
        <button
          onClick={handleDraft}
          disabled={!title.trim()}
          className="text-xs font-semibold text-violet-700 hover:underline px-2 disabled:opacity-40"
        >
          Guardar rascunho
        </button>
      </header>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4">
        <Section title="1. Informação básica" open={openSec.s1} onToggle={() => toggle("s1")}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do artigo..."
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white font-display font-semibold text-base text-slate-900 placeholder:font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300"
          />
          {fieldErrors.title && <p className="text-xs text-red-600">{fieldErrors.title}</p>}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300"
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, 200))}
              placeholder="Resumo curto do artigo (máx 200 caracteres)..."
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 resize-none focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300"
            />
            <div className="text-[10px] text-muted-foreground font-mono-accent text-right mt-1">
              {excerpt.length}/200
            </div>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-300"
          />
        </Section>

        <Section title="2. Conteúdo por nível" open={openSec.s2} onToggle={() => toggle("s2")}>
          <div className="grid grid-cols-3 gap-2">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`p-3 rounded-lg text-left border transition-colors ${
                    active
                      ? "border-slate-300 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                    <span className="font-display font-semibold text-sm text-slate-900">
                      {t.label}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono-accent text-muted-foreground mt-0.5">
                    {t.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
          {tabs.map(
            (t) =>
              activeTab === t.id && (
                <RichTextEditor
                  key={t.id}
                  initialHtml={content[t.id]}
                  limit={LEVEL_CHAR_LIMIT}
                  placeholder={t.placeholder}
                  onChange={(html, len) => {
                    setContent((c) => ({ ...c, [t.id]: html }));
                    setContentLength((c) => ({ ...c, [t.id]: len }));
                  }}
                />
              ),
          )}
          {fieldErrors["content.basico"] && (
            <p className="text-xs text-red-600">{fieldErrors["content.basico"]}</p>
          )}
        </Section>

        <Section
          title="3. Glossário de termos-chave"
          open={openSec.s3}
          onToggle={() => toggle("s3")}
        >
          {terms.length > 0 && (
            <ul className="space-y-2">
              {terms.map((t, i) => (
                <li key={i} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50">
                  <div className="flex-1 text-sm">
                    <span className="font-semibold text-slate-800">{t.term}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      — {t.definition.slice(0, 80)}
                      {t.definition.length > 80 ? "…" : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => setTerms((xs) => xs.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showTermForm ? (
            <div className="space-y-2 p-3 rounded-lg border border-slate-200">
              <input
                value={newTerm.term}
                onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                placeholder="Termo"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300"
              />
              <input
                value={newTerm.definition}
                onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
                placeholder="Definição"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowTermForm(false);
                    setNewTerm({ term: "", definition: "" });
                  }}
                  className="text-xs font-semibold text-muted-foreground px-3 py-1.5"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!newTerm.term.trim() || !newTerm.definition.trim()) return;
                    setTerms((xs) => [...xs, newTerm]);
                    setNewTerm({ term: "", definition: "" });
                    setShowTermForm(false);
                  }}
                  className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-md transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          ) : (
            terms.length < 8 && (
              <button
                onClick={() => setShowTermForm(true)}
                className="btn-ghost w-full flex items-center justify-center gap-1"
              >
                <Plus size={16} /> Adicionar termo
              </button>
            )
          )}
        </Section>

        <Section
          title="4. Referências bibliográficas"
          open={openSec.s4}
          onToggle={() => toggle("s4")}
        >
          <div className="flex gap-2 p-3 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-900">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>
              Artigos sem referências são classificados como <strong>Opinião</strong> e aparecem com
              badge específico para os leitores.
            </p>
          </div>
          {refs.length > 0 && (
            <ul className="space-y-2">
              {refs.map((r, i) => (
                <li key={i} className="flex items-start gap-2 p-3 rounded-lg bg-slate-50">
                  <div className="flex-1 text-sm min-w-0">
                    <div className="font-semibold text-slate-800 truncate">{r.label}</div>
                    {r.url && <div className="text-xs text-muted-foreground truncate">{r.url}</div>}
                  </div>
                  <button
                    onClick={() => setRefs((xs) => xs.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {showRefForm ? (
            <div className="space-y-2 p-3 rounded-lg border border-slate-200">
              <input
                value={newRef.label}
                onChange={(e) => setNewRef({ ...newRef, label: e.target.value })}
                placeholder="Fonte / Título"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300"
              />
              <input
                value={newRef.url}
                onChange={(e) => setNewRef({ ...newRef, url: e.target.value })}
                placeholder="URL (opcional)"
                className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowRefForm(false);
                    setNewRef({ label: "", url: "" });
                  }}
                  className="text-xs font-semibold text-muted-foreground px-3 py-1.5"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!newRef.label.trim()) return;
                    setRefs((xs) => [...xs, newRef]);
                    setNewRef({ label: "", url: "" });
                    setShowRefForm(false);
                  }}
                  className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 px-3 py-1.5 rounded-md transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowRefForm(true)}
              className="btn-ghost w-full flex items-center justify-center gap-1"
            >
              <Plus size={16} /> Adicionar referência
            </button>
          )}
        </Section>

        <Section title="5. Imagem e áudio" open={openSec.s5} onToggle={() => toggle("s5")}>
          {/* Imagem de capa */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Imagem de capa
            </p>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden aspect-video bg-slate-100">
                <img
                  src={imagePreview}
                  alt="Pré-visualização"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/75 transition-colors"
                  aria-label="Remover imagem"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-full aspect-video rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-violet-300 hover:text-violet-600 transition-colors"
              >
                <ImageIcon size={22} />
                <span className="text-xs font-semibold">
                  Carregar imagem (até {MAX_IMAGE_MB}MB)
                </span>
              </button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Áudio: gravar ou importar */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Áudio (Girassol Lê)
            </p>

            {!audioFile && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setAudioTab("gravar")}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${audioTab === "gravar" ? "bg-violet-600 text-white border-transparent" : "border-slate-200 text-muted-foreground hover:border-slate-300"}`}
                >
                  <Mic size={13} /> Gravar
                </button>
                <button
                  type="button"
                  onClick={() => setAudioTab("importar")}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${audioTab === "importar" ? "bg-violet-600 text-white border-transparent" : "border-slate-200 text-muted-foreground hover:border-slate-300"}`}
                >
                  <Upload size={13} /> Importar ficheiro
                </button>
              </div>
            )}

            {audioFile && audioPreview ? (
              <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {audioSourceLabel}
                  </span>
                  <button
                    onClick={removeAudio}
                    className="text-muted-foreground hover:text-red-600 shrink-0"
                    aria-label="Remover áudio"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <audio controls src={audioPreview} className="w-full h-10" />
                {audioDurationLabel && (
                  <p className="text-[10px] text-muted-foreground font-mono-accent">
                    Duração: {audioDurationLabel}
                  </p>
                )}
              </div>
            ) : audioTab === "gravar" ? (
              <div className="rounded-lg border border-slate-200 p-4 flex flex-col items-center gap-3">
                {isRecording ? (
                  <>
                    <div className="flex items-center gap-2 text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <span className="font-mono-accent text-sm">
                        {formatDuration(recordingSeconds)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                      aria-label="Parar gravação"
                    >
                      <Square size={16} fill="white" />
                    </button>
                    <p className="text-[11px] text-muted-foreground">A gravar…</p>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors"
                      aria-label="Começar a gravar"
                    >
                      <Mic size={18} />
                    </button>
                    <p className="text-[11px] text-muted-foreground">
                      Toca para gravar com o microfone
                    </p>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-violet-300 hover:text-violet-600 transition-colors"
              >
                <Upload size={20} />
                <span className="text-xs font-semibold">
                  Escolher ficheiro de áudio (até {MAX_AUDIO_MB}MB)
                </span>
              </button>
            )}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileChange}
              className="hidden"
            />
          </div>
        </Section>
      </div>

      <footer className="fixed bottom-0 inset-x-0 md:left-60 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm p-3 flex gap-2 mb-16 md:mb-0">
        <button onClick={handleDraft} className="btn-ghost flex-1">
          Guardar rascunho
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "A submeter…" : "Submeter para revisão"}
        </button>
      </footer>
    </div>
  );
};
