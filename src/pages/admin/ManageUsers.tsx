import { useState, useEffect } from "react";
import { Check, X, Trash2, UserCheck, ShieldAlert, Search } from "lucide-react";
import { toast } from "sonner";
import { api, type ApiUser } from "../../lib/apiClient";
import { roleLabels, rolePillCls } from "../../data/adminData";

type FilterKey = "todos" | "user" | "researcher" | "expert" | "candidatos" | "suspensos";

const filters: { id: FilterKey; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "user", label: "Utilizadores" },
  { id: "researcher", label: "Pesquisadores" },
  { id: "expert", label: "Especialistas" },
  { id: "candidatos", label: "Candidatos" },
  { id: "suspensos", label: "Suspensos" },
];

function Spinner() {
  return (
    <div className="w-6 h-6 rounded-full border-2 border-slate-400 border-t-transparent animate-spin mx-auto" />
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarColor(id: number) {
  const colors = [
    "bg-violet-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
  ];
  return colors[id % colors.length];
}

function UserCard({
  user,
  onUpdate,
  onDelete,
}: {
  user: ApiUser;
  onUpdate: (id: number, changes: Partial<ApiUser>) => void;
  onDelete: (id: number) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleVerify = async () => {
    const next = !user.verified;
    onUpdate(user.id, { verified: next });
    try {
      await api.put(`/admin/users/${user.id}`, { verified: next });
      toast(next ? "Utilizador verificado." : "Verificação removida.");
    } catch {
      onUpdate(user.id, { verified: user.verified });
      toast.error("Erro ao actualizar.");
    }
  };

  const toggleSuspend = async () => {
    const next = !user.suspended;
    onUpdate(user.id, { suspended: next });
    try {
      await api.put(`/admin/users/${user.id}`, { suspended: next });
      toast(next ? "Conta suspensa." : "Conta reactivada.");
    } catch {
      onUpdate(user.id, { suspended: user.suspended });
      toast.error("Erro ao actualizar.");
    }
  };

  const changeRole = async (role: string) => {
    onUpdate(user.id, { role });
    try {
      await api.put(`/admin/users/${user.id}`, { role });
      toast(`Papel alterado para ${roleLabels[role as keyof typeof roleLabels] ?? role}.`);
    } catch {
      onUpdate(user.id, { role: user.role });
      toast.error("Erro ao actualizar.");
    }
  };

  const approveApplication = async () => {
    onUpdate(user.id, { role: "researcher", applied_for_researcher: false });
    try {
      await api.put(`/admin/users/${user.id}`, {
        role: "researcher",
        applied_for_researcher: false,
      });
      toast.success("Candidatura aprovada. Utilizador promovido a Pesquisador.");
    } catch {
      onUpdate(user.id, { role: user.role, applied_for_researcher: user.applied_for_researcher });
      toast.error("Erro ao aprovar.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${user.id}`);
      onDelete(user.id);
      toast("Conta eliminada.");
    } catch {
      toast.error("Erro ao eliminar conta.");
      setConfirmDelete(false);
    }
  };

  const rolePill =
    rolePillCls[user.role as keyof typeof rolePillCls] ?? "bg-muted text-muted-foreground";
  const roleLabel = roleLabels[user.role as keyof typeof roleLabels] ?? user.role;

  return (
    <div className={`card-app p-4 space-y-3 ${user.suspended ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl ${avatarColor(user.id)} grid place-items-center text-white font-display font-bold text-sm shrink-0`}
        >
          {initials(user.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-display font-semibold text-sm">{user.name}</span>
            {user.verified && (
              <span className="pill bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                <Check size={10} /> Verificado
              </span>
            )}
            {user.suspended && (
              <span className="pill bg-red-100 text-red-700 flex items-center gap-0.5">
                <ShieldAlert size={10} /> Suspenso
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`pill ${rolePill}`}>{roleLabel}</span>
            {user.applied_for_researcher && user.role === "user" && (
              <span className="pill bg-amber-100 text-amber-700 flex items-center gap-0.5">
                <UserCheck size={10} /> Candidato
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground font-mono-accent mt-1">
            Aderiu {user.joinedAt} · {user.contributions} contrib. · {user.debates_count} debates
          </p>
        </div>
      </div>

      {user.applied_for_researcher && user.role === "user" && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200">
          <UserCheck size={14} className="text-amber-700 shrink-0" />
          <p className="text-xs text-amber-800 flex-1">Candidatura a Pesquisador pendente</p>
          <button
            onClick={approveApplication}
            className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Aprovar
          </button>
        </div>
      )}

      <div className="pt-2 border-t border-border space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Papel:</span>
            <select
              value={user.role}
              onChange={(e) => changeRole(e.target.value)}
              className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="user">Utilizador</option>
              <option value="researcher">Pesquisador</option>
              <option value="expert">Especialista</option>
            </select>
          </div>
          <button
            onClick={toggleVerify}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              user.verified
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-border bg-muted text-muted-foreground hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            {user.verified ? "Desverificar" : "Verificar"}
          </button>
          <button
            onClick={toggleSuspend}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              user.suspended
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            {user.suspended ? "Activar conta" : "Suspender"}
          </button>
        </div>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600 flex-1">Confirmar eliminação permanente?</span>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs font-semibold text-muted-foreground px-2 py-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="text-xs font-semibold text-white bg-red-600 px-3 py-1 rounded-lg"
            >
              Eliminar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 px-1"
          >
            <Trash2 size={12} /> Eliminar conta
          </button>
        )}
      </div>
    </div>
  );
}

export const ManageUsers = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("todos");

  useEffect(() => {
    api
      .get<ApiUser[]>("/admin/users")
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    switch (filter) {
      case "todos":
        return true;
      case "candidatos":
        return !!u.applied_for_researcher && u.role === "user";
      case "suspensos":
        return u.suspended;
      default:
        return u.role === filter;
    }
  });

  const updateUser = (id: number, changes: Partial<ApiUser>) =>
    setUsers((xs) => xs.map((u) => (u.id === id ? { ...u, ...changes } : u)));

  const deleteUser = (id: number) => setUsers((xs) => xs.filter((u) => u.id !== id));

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-4">
      <header>
        <h1 className="font-display font-bold text-2xl md:text-3xl">Utilizadores</h1>
        <p className="text-sm text-muted-foreground">
          Gere contas, papéis, verificações e candidaturas.
        </p>
      </header>

      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`pill transition-colors whitespace-nowrap ${filter === f.id ? "bg-slate-700 text-white" : "bg-muted text-muted-foreground hover:bg-slate-100 hover:text-slate-700"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card-app p-8 flex justify-center">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-app p-10 text-center text-sm text-muted-foreground">
          Nenhum utilizador encontrado.
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground font-mono-accent">
            {filtered.length} {filtered.length === 1 ? "utilizador" : "utilizadores"}
          </p>
          <div className="space-y-3">
            {filtered.map((u) => (
              <UserCard key={u.id} user={u} onUpdate={updateUser} onDelete={deleteUser} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
