import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import type { ExpertiseItem } from "../../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/apiClient";
import {
  User,
  MessageSquare,
  BookOpen,
  Bell,
  Shield,
  ChevronRight,
  LogOut,
  Edit2,
  FileText,
  GraduationCap,
  Briefcase,
  Plus,
  X,
  Check,
  PenLine,
  Mail,
} from "lucide-react";
import { WriterApplicationModal } from "../../components/ui/WriterApplicationModal";
import { toast } from "sonner";
import { profileNameSchema, readerProfileInfoSchema } from "../../lib/validation/profile";

const SETTINGS = [
  { icon: Bell, label: "Notificações", desc: "Debates e respostas" },
  { icon: BookOpen, label: "Nível padrão", desc: "Intermédio" },
  { icon: Shield, label: "Privacidade", desc: "Conta pública" },
];

const ACADEMIC_LEVELS = [
  "Ensino Médio",
  "Licenciatura",
  "Pós-Graduação",
  "Mestrado",
  "Doutoramento",
];

const TOPICS = [
  "Economia",
  "Política",
  "Saúde",
  "Educação",
  "Direito",
  "Ciência & Tecnologia",
  "Ambiente",
  "Cultura",
  "Segurança",
  "Relações Internacionais",
];

const LEVEL_LABELS: Record<ExpertiseItem["level"], string> = {
  basico: "Básico",
  intermedio: "Intermédio",
  avancado: "Avançado",
};

const LEVEL_COLORS: Record<ExpertiseItem["level"], string> = {
  basico: "bg-green-50 text-green-700 border-green-200",
  intermedio: "bg-amber-50 text-amber-700 border-amber-200",
  avancado: "bg-blue-50 text-blue-700 border-blue-200",
};

export const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [editingInfo, setEditingInfo] = useState(false);
  const [academicLevel, setAcademicLevel] = useState(user?.academicLevel ?? "");
  const [academicArea, setAcademicArea] = useState(user?.academicArea ?? "");
  const [institution, setInstitution] = useState(user?.institution ?? "");
  const [profession, setProfession] = useState(user?.profession ?? "");
  const [organization, setOrganization] = useState(user?.organization ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [savingInfo, setSavingInfo] = useState(false);

  const [showWriterModal, setShowWriterModal] = useState(false);
  const [autoOpenWriterModal, setAutoOpenWriterModal] = useState(
    searchParams.get("openWriterModal") === "1",
  );
  const [showRequestReceivedModal, setShowRequestReceivedModal] = useState(false);

  const [expertise, setExpertise] = useState<ExpertiseItem[]>(user?.expertise ?? []);
  const [addingTopic, setAddingTopic] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newLevel, setNewLevel] = useState<ExpertiseItem["level"]>("basico");
  const [nameError, setNameError] = useState("");
  const [infoErrors, setInfoErrors] = useState<Record<string, string>>({});

  // Chegou aqui a partir do botão "+" da barra inferior (utilizador que
  // ainda não é pesquisador). Abre a candidatura automaticamente, como se
  // tivesse clicado em "Candidatar-me a Pesquisador".
  useEffect(() => {
    if (!autoOpenWriterModal) return;

    const next = new URLSearchParams(searchParams);
    next.delete("openWriterModal");
    setSearchParams(next, { replace: true });
  }, [autoOpenWriterModal, searchParams, setSearchParams]);

  const shouldShowWriterModal =
    showWriterModal ||
    (autoOpenWriterModal && user?.role === "user" && !user?.appliedForResearcher);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("") ?? "?";

  const saveName = async () => {
    const result = profileNameSchema.safeParse({ name });
    if (!result.success) {
      setNameError(result.error.issues[0].message);
      return;
    }
    setNameError("");
    setSavingName(true);
    try {
      await api.put("/users/profile", { name: result.data.name });
      await refreshUser();
    } catch {
      toast.error("Erro ao guardar nome.");
    } finally {
      setSavingName(false);
      setEditingName(false);
    }
  };

  const saveInfo = async () => {
    const result = readerProfileInfoSchema.safeParse({
      academicLevel,
      academicArea,
      institution,
      profession,
      organization,
      bio,
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) errors[issue.path.join(".")] = issue.message;
      setInfoErrors(errors);
      toast.error(result.error.issues[0].message);
      return;
    }
    setInfoErrors({});
    setSavingInfo(true);
    try {
      await api.put("/users/profile", {
        academicLevel: result.data.academicLevel,
        academicArea: result.data.academicArea,
        institution: result.data.institution,
        profession: result.data.profession,
        organization: result.data.organization,
        bio: result.data.bio,
      });
      await refreshUser();
      setEditingInfo(false);
    } catch {
      toast.error("Erro ao guardar informação.");
    } finally {
      setSavingInfo(false);
    }
  };

  const cancelInfo = () => {
    setAcademicLevel(user?.academicLevel ?? "");
    setAcademicArea(user?.academicArea ?? "");
    setInstitution(user?.institution ?? "");
    setProfession(user?.profession ?? "");
    setOrganization(user?.organization ?? "");
    setBio(user?.bio ?? "");
    setInfoErrors({});
    setEditingInfo(false);
  };

  const addExpertise = async () => {
    if (!newTopic) return;
    const updated = [...expertise, { topic: newTopic, level: newLevel }];
    setExpertise(updated);
    setNewTopic("");
    setNewLevel("basico");
    setAddingTopic(false);
    try {
      await api.put("/users/profile", { expertise: updated });
      await refreshUser();
    } catch {
      toast.error("Erro ao adicionar área.");
      setExpertise(expertise);
    }
  };

  const removeExpertise = async (topic: string) => {
    const updated = expertise.filter((e) => e.topic !== topic);
    setExpertise(updated);
    try {
      await api.put("/users/profile", { expertise: updated });
      await refreshUser();
    } catch {
      toast.error("Erro ao remover área.");
      setExpertise(expertise);
    }
  };

  const handleWriterConfirm = async (data: {
    focusArea: string;
    motivation: string;
    portfolioUrl: string;
  }) => {
    try {
      await api.post("/users/apply-researcher", {
        focusArea: data.focusArea,
        motivation: data.motivation,
        portfolioUrl: data.portfolioUrl || undefined,
      });

      await refreshUser();

      setShowWriterModal(false);
      setAutoOpenWriterModal(false);
      setShowRequestReceivedModal(true);
    } catch (e) {
      toast.error((e as Error).message ?? "Erro ao submeter candidatura.");
    }
  };

  const safeExpertise = Array.isArray(expertise) ? expertise : [];
  const availableTopics = TOPICS.filter((t) => !safeExpertise.find((e) => e.topic === t));
  const hasInfo =
    (user?.academicLevel ?? academicLevel) ||
    (user?.profession ?? profession) ||
    (user?.bio ?? bio);

  return (
    <>
      <div className="px-4 py-5 space-y-5">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-2xl">
            {initials}
          </div>
          {editingName ? (
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveName()}
                  className="rounded-xl border border-border px-3 py-1.5 text-sm font-semibold text-center outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
                <button
                  onClick={saveName}
                  disabled={savingName}
                  className="text-xs text-primary font-semibold"
                >
                  {savingName ? "…" : "Guardar"}
                </button>
              </div>
              {nameError && <p className="text-xs text-destructive">{nameError}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl">{user?.name}</h2>
              <button
                onClick={() => setEditingName(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {user?.verified && (
              <span className="pill bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
                <Check size={11} /> Conta verificada
              </span>
            )}
            {user?.role === "expert" && (
              <span className="pill bg-blue-50 text-blue-600 border border-blue-100">
                Especialista verificado
              </span>
            )}
            {user?.role === "researcher" && (
              <span className="pill bg-violet-50 text-violet-700 border border-violet-200">
                Leitor / Pesquisador
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="card-app grid grid-cols-3 gap-0 overflow-hidden">
          {[
            { icon: MessageSquare, n: user?.debates ?? 0, label: "Debates" },
            { icon: User, n: user?.contributions ?? 0, label: "Contribuições" },
            { icon: BookOpen, n: 3, label: "Artigos lidos" },
          ].map(({ icon: Icon, n, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center py-4 ${i < 2 ? "border-r border-border" : ""}`}
            >
              <Icon size={16} className="text-primary mb-1" />
              <div className="font-display font-bold text-xl">{n}</div>
              <div className="text-[10px] text-muted-foreground font-mono-accent uppercase mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Member since */}
        <div className="card-app p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-mono-accent uppercase tracking-wide">
              Membro desde
            </p>
            <p className="font-semibold text-sm mt-0.5">{user?.joinedAt}</p>
          </div>
          <span className="pill bg-primary/10 text-primary">Gratuito</span>
        </div>

        {/* Writer application */}
        {user?.role === "user" && !user.appliedForResearcher && (
          <button
            onClick={() => setShowWriterModal(true)}
            className="card-app w-full p-4 flex items-center gap-3 hover:bg-violet-50 transition-colors border border-violet-100 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
              <PenLine size={17} className="text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-violet-700">Candidatar-me a Pesquisador</p>
              <p className="text-xs text-muted-foreground">
                Publica artigos e análises na plataforma
              </p>
            </div>
            <ChevronRight size={15} className="text-violet-400" />
          </button>
        )}

        {user?.appliedForResearcher && user.role === "user" && (
          <div className="card-app p-4 flex items-center gap-3 bg-violet-50 border border-violet-200">
            <Check size={18} className="text-violet-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-violet-700">Candidatura em análise</p>
              <p className="text-xs text-muted-foreground">
                A equipa irá analisar o teu perfil em breve.
              </p>
            </div>
          </div>
        )}

        {/* Academic & Professional */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-base">
              Informação Académica & Profissional
            </h3>
            {!editingInfo && (
              <button
                onClick={() => setEditingInfo(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit2 size={15} />
              </button>
            )}
          </div>

          {editingInfo ? (
            <div className="card-app p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Habilitações
                </label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                >
                  <option value="">Seleccionar nível</option>
                  {ACADEMIC_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Área académica
                </label>
                <input
                  value={academicArea}
                  onChange={(e) => setAcademicArea(e.target.value)}
                  placeholder="Ex: Direito, Economia, Medicina…"
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Instituição
                </label>
                <input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Universidade ou escola"
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="pt-1 border-t border-border">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 mt-2">
                  Profissão
                </label>
                <input
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Ex: Jornalista, Economista, Médico…"
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Entidade / Organização
                </label>
                <input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Empresa, ONG, instituição…"
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Breve bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 220))}
                  placeholder="Descreve-te em poucas palavras…"
                  rows={3}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <p className="text-right text-[10px] text-muted-foreground mt-0.5">
                  {bio.length}/220
                </p>
                {infoErrors.bio && (
                  <p className="text-xs text-destructive mt-0.5">{infoErrors.bio}</p>
                )}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={saveInfo}
                  disabled={savingInfo}
                  className="btn-primary flex-1 py-2 text-sm"
                >
                  {savingInfo ? "A guardar…" : "Guardar"}
                </button>
                <button
                  onClick={cancelInfo}
                  className="flex-1 py-2 text-sm rounded-xl border border-border font-semibold hover:bg-secondary/50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : hasInfo ? (
            <div className="card-app p-4 space-y-3">
              {user?.academicLevel && (
                <div className="flex items-start gap-2.5">
                  <GraduationCap size={15} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Habilitações</p>
                    <p className="text-sm font-semibold">
                      {user.academicLevel}
                      {user.academicArea ? ` · ${user.academicArea}` : ""}
                    </p>
                    {user.institution && (
                      <p className="text-xs text-muted-foreground">{user.institution}</p>
                    )}
                  </div>
                </div>
              )}
              {user?.profession && (
                <div className="flex items-start gap-2.5">
                  <Briefcase size={15} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Profissão</p>
                    <p className="text-sm font-semibold">{user.profession}</p>
                    {user.organization && (
                      <p className="text-xs text-muted-foreground">{user.organization}</p>
                    )}
                  </div>
                </div>
              )}
              {user?.bio && (
                <p className="text-sm text-muted-foreground italic border-t border-border pt-3">
                  "{user.bio}"
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setEditingInfo(true)}
              className="card-app w-full p-4 flex items-center gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors border-2 border-dashed border-border"
            >
              <Plus size={16} />
              <span className="text-sm">Adicionar informação académica e profissional</span>
            </button>
          )}
        </div>

        {/* Expertise */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-base">Áreas de Conhecimento</h3>
            {availableTopics.length > 0 && !addingTopic && (
              <button
                onClick={() => setAddingTopic(true)}
                className="flex items-center gap-1 text-sm text-primary font-semibold"
              >
                <Plus size={14} /> Adicionar
              </button>
            )}
          </div>

          <div className="space-y-2">
            {expertise.map(({ topic, level }) => (
              <div key={topic} className="card-app px-4 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold">{topic}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[level]}`}
                  >
                    {LEVEL_LABELS[level]}
                  </span>
                  <button
                    onClick={() => removeExpertise(topic)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}

            {addingTopic && (
              <div className="card-app p-4 space-y-3 border-2 border-primary/20">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Área / Tópico
                  </label>
                  <select
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                    autoFocus
                  >
                    <option value="">Seleccionar área</option>
                    {availableTopics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    Nível de conhecimento
                  </label>
                  <div className="flex gap-2">
                    {(["basico", "intermedio", "avancado"] as ExpertiseItem["level"][]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setNewLevel(l)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${newLevel === l ? `${LEVEL_COLORS[l]} border-current` : "border-border text-muted-foreground hover:border-primary/40"}`}
                      >
                        {LEVEL_LABELS[l]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addExpertise}
                    disabled={!newTopic}
                    className="btn-primary flex-1 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => {
                      setAddingTopic(false);
                      setNewTopic("");
                    }}
                    className="flex-1 py-2 text-sm rounded-xl border border-border font-semibold hover:bg-secondary/50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {expertise.length === 0 && !addingTopic && (
              <button
                onClick={() => setAddingTopic(true)}
                className="card-app w-full p-4 flex items-center gap-3 text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors border-2 border-dashed border-border"
              >
                <Plus size={16} />
                <span className="text-sm">Adicionar área de conhecimento</span>
              </button>
            )}
          </div>
        </div>

        {/* Settings */}
        <div>
          <h3 className="font-display font-bold text-base mb-3">Definições</h3>
          <div className="card-app overflow-hidden divide-y divide-border">
            {SETTINGS.map(({ icon: Icon, label, desc }) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
                <ChevronRight size={15} className="text-muted-foreground" />
              </button>
            ))}
            <button
              onClick={() => navigate("/politicas")}
              className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <FileText size={15} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Políticas & Privacidade</div>
                <div className="text-xs text-muted-foreground">
                  Termos de uso e protecção de dados
                </div>
              </div>
              <ChevronRight size={15} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full card-app p-4 flex items-center gap-3 text-destructive hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          <span className="font-semibold text-sm">Terminar sessão</span>
        </button>
      </div>

      {shouldShowWriterModal && (
        <WriterApplicationModal
          onConfirm={handleWriterConfirm}
          onClose={() => {
            setShowWriterModal(false);
            setAutoOpenWriterModal(false);
          }}
        />
      )}

      {showRequestReceivedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-violet-600" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Pedido recebido!</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Recebemos a tua candidatura a Pesquisador. A nossa equipa vai analisá-la e, caso seja
              aceite, serás notificado.
            </p>
            <button
              onClick={() => setShowRequestReceivedModal(false)}
              className="btn-primary w-full mt-5 py-2.5 text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
