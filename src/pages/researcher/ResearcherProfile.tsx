import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Edit2, Check, GraduationCap, Briefcase, Globe, Link as LinkIcon, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import type { ExpertiseItem } from "../../context/AuthContext";
import { api } from "../../lib/apiClient";
import { levelMeta } from "../../data/researcherData";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function Card({ title, icon: Icon, children }: { title: string; icon?: typeof Edit2; children: React.ReactNode }) {
  return (
    <div className="card-app p-4 space-y-3">
      <h3 className="font-display font-semibold flex items-center gap-2">
        {Icon && <Icon size={16} className="text-violet-700" strokeWidth={1.8} />}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] font-mono-accent text-muted-foreground uppercase">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 mt-1" />
    </div>
  );
}

function FieldIcon({ icon: Icon, value, onChange, placeholder }: {
  icon: typeof Globe; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border">
      <Icon size={14} className="text-muted-foreground shrink-0" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 bg-transparent text-sm focus:outline-none" />
    </div>
  );
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display font-bold text-xl text-primary">{n}</div>
      <div className="text-[10px] font-mono-accent text-muted-foreground uppercase">{label}</div>
    </div>
  );
}

export const ResearcherProfile = () => {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState(user?.bio ?? "");
  const [academicLevel, setAcademicLevel] = useState(user?.academicLevel ?? "");
  const [academicArea, setAcademicArea] = useState(user?.academicArea ?? "");
  const [institution, setInstitution] = useState(user?.institution ?? "");
  const [profession, setProfession] = useState(user?.profession ?? "");
  const [organization, setOrganization] = useState(user?.organization ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");
  const [linkedin, setLinkedin] = useState(user?.linkedin ?? "");
  const [expertise, setExpertise] = useState<ExpertiseItem[]>(user?.expertise ?? []);
  const [newExp, setNewExp] = useState<ExpertiseItem>({ topic: "", level: "basico" });
  const [showExpForm, setShowExpForm] = useState(false);

  const startEdit = () => {
    setBio(user?.bio ?? "");
    setAcademicLevel(user?.academicLevel ?? "");
    setAcademicArea(user?.academicArea ?? "");
    setInstitution(user?.institution ?? "");
    setProfession(user?.profession ?? "");
    setOrganization(user?.organization ?? "");
    setWebsite(user?.website ?? "");
    setLinkedin(user?.linkedin ?? "");
    setExpertise(user?.expertise ?? []);
    setEditing(true);
  };

  const cancel = () => { setEditing(false); setShowExpForm(false); };

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/users/profile", {
        bio,
        academic_level: academicLevel,
        academic_area: academicArea,
        institution,
        profession,
        organization,
        website: website || null,
        linkedin: linkedin || null,
        expertise,
      });
      await refreshUser();
      setEditing(false);
      setShowExpForm(false);
      toast.success("Perfil actualizado.");
    } catch (e) {
      toast.error((e as Error).message ?? "Erro ao guardar perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-20 h-14 px-4 flex items-center gap-2 border-b border-border bg-white/95 backdrop-blur-sm">
        <Link to="/researcher" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft size={18} /> Voltar
        </Link>
        <h1 className="flex-1 text-center font-display font-bold text-base">Perfil Público</h1>
        {!editing ? (
          <button onClick={startEdit} className="text-violet-700 hover:bg-violet-50 p-2 rounded-lg transition-colors">
            <Edit2 size={16} />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </header>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4">
        {/* Identidade */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-primary grid place-items-center text-white font-display font-bold text-2xl shadow-md shrink-0">
            {initials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-xl truncate">{user.name}</h2>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="pill bg-violet-100 text-violet-700">Leitor / Pesquisador</span>
              {user.verified && (
                <span className="pill bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <Check size={11} /> Verificado
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1 truncate">{user.email}</p>
          </div>
        </div>

        {/* Sobre mim */}
        <Card title="Sobre mim">
          {editing ? (
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          ) : (
            <p className="text-sm italic text-muted-foreground">"{user.bio || "Sem bio ainda."}"</p>
          )}
        </Card>

        {/* Credenciais */}
        <Card title="Credenciais académicas" icon={GraduationCap}>
          {editing ? (
            <div className="space-y-2">
              <Field label="Habilitações" value={academicLevel} onChange={setAcademicLevel} />
              <Field label="Área" value={academicArea} onChange={setAcademicArea} />
              <Field label="Instituição" value={institution} onChange={setInstitution} />
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <p><span className="font-semibold">{user.academicLevel || "—"}</span>{user.academicArea ? ` · ${user.academicArea}` : ""}</p>
              <p className="text-muted-foreground">{user.institution || ""}</p>
            </div>
          )}
        </Card>

        {/* Experiência */}
        <Card title="Experiência profissional" icon={Briefcase}>
          {editing ? (
            <div className="space-y-2">
              <Field label="Profissão" value={profession} onChange={setProfession} />
              <Field label="Organização" value={organization} onChange={setOrganization} />
            </div>
          ) : (
            <div className="text-sm space-y-1">
              <p className="font-semibold">{user.profession || "—"}</p>
              <p className="text-muted-foreground">{user.organization || ""}</p>
            </div>
          )}
        </Card>

        {/* Expertise */}
        <Card title="Áreas de conhecimento">
          <ul className="space-y-2">
            {expertise.map((e, i) => {
              const m = levelMeta[e.level];
              return (
                <li key={i} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-muted">
                  <span className="font-semibold text-sm">{e.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className={`pill ${m.cls}`}>{m.label}</span>
                    {editing && (
                      <button onClick={() => setExpertise(expertise.filter((_, j) => j !== i))}
                        className="text-muted-foreground hover:text-red-600 transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {editing && (
            showExpForm ? (
              <div className="mt-2 p-3 rounded-xl border border-border space-y-2">
                <input value={newExp.topic} onChange={(e) => setNewExp({ ...newExp, topic: e.target.value })}
                  placeholder="Área (ex: Educação)" className="w-full px-3 py-2 rounded-lg border border-border text-sm" />
                <select value={newExp.level} onChange={(e) => setNewExp({ ...newExp, level: e.target.value as ExpertiseItem["level"] })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm">
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermédio</option>
                  <option value="avancado">Avançado</option>
                </select>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setShowExpForm(false); setNewExp({ topic: "", level: "basico" }); }}
                    className="text-xs font-semibold text-muted-foreground px-3 py-1.5">Cancelar</button>
                  <button onClick={() => { if (!newExp.topic.trim()) return; setExpertise([...expertise, newExp]); setNewExp({ topic: "", level: "basico" }); setShowExpForm(false); }}
                    className="text-xs font-semibold text-white bg-violet-600 px-3 py-1.5 rounded-lg">Adicionar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowExpForm(true)} className="btn-ghost w-full flex items-center justify-center gap-1 mt-2">
                <Plus size={16} /> Adicionar área
              </button>
            )
          )}
        </Card>

        {/* Estatísticas públicas */}
        <Card title="Estatísticas públicas">
          <div className="grid grid-cols-3 gap-3 divide-x divide-border">
            <Stat n={user.contributions ?? 0} label="Artigos" />
            <Stat n={user.debates ?? 0} label="Debates" />
            <Stat n="—" label="Leituras" />
          </div>
        </Card>

        {/* Ligações externas */}
        <Card title="Ligações externas">
          {editing ? (
            <div className="space-y-2">
              <FieldIcon icon={Globe} value={website} onChange={setWebsite} placeholder="https://..." />
              <FieldIcon icon={LinkIcon} value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/..." />
            </div>
          ) : (
            <div className="text-sm space-y-2">
              {user.website ? (
                <a href={user.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-violet-700 hover:underline truncate">
                  <Globe size={14} /> {user.website}
                </a>
              ) : null}
              {user.linkedin ? (
                <a href={user.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-violet-700 hover:underline truncate">
                  <LinkIcon size={14} /> {user.linkedin}
                </a>
              ) : null}
              {!user.website && !user.linkedin && (
                <p className="text-muted-foreground text-sm">Sem ligações externas.</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {editing && (
        <footer className="fixed bottom-0 inset-x-0 md:left-60 z-20 border-t border-border bg-white/95 backdrop-blur-sm p-3 flex gap-2 mb-16 md:mb-0">
          <button onClick={cancel} className="btn-ghost flex-1">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary flex-1">
            {saving ? "A guardar…" : "Guardar alterações"}
          </button>
        </footer>
      )}
    </div>
  );
};
