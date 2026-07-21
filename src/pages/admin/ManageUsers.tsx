import { useState, useEffect, useRef } from "react";
import { Check, X, Trash2, UserCheck, ShieldAlert, Search, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { api, type ApiUser, type Paginated } from "../../lib/apiClient";
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
    <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin mx-auto" />
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

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

function UserRow({
  user,
  onUpdate,
  onDelete,
}: {
  user: ApiUser;
  onUpdate: (id: number, changes: Partial<ApiUser>) => void;
  onDelete: (id: number) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));

  const toggleVerify = async () => {
    const next = !user.verified;
    onUpdate(user.id, { verified: next });
    setMenuOpen(false);
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
    setMenuOpen(false);
    try {
      await api.put(`/admin/users/${user.id}`, { suspended: next });
      toast(next ? "Conta suspensa." : "Conta reactivada.");
    } catch {
      onUpdate(user.id, { suspended: user.suspended });
      toast.error("Erro ao actualizar.");
    }
  };

  const changeRole = async (role: ApiUser["role"]) => {
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
    onUpdate(user.id, { role: "researcher", appliedForResearcher: false });
    try {
      await api.put(`/admin/users/${user.id}`, {
        role: "researcher",
        appliedForResearcher: false,
      });
      toast.success("Candidatura aprovada. Utilizador promovido a Pesquisador.");
    } catch {
      onUpdate(user.id, { role: user.role, appliedForResearcher: user.appliedForResearcher });
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
    rolePillCls[user.role as keyof typeof rolePillCls] ?? "bg-slate-100 text-slate-600";
  const roleLabel = roleLabels[user.role as keyof typeof roleLabels] ?? user.role;
  const isPending = user.appliedForResearcher && user.role === "user";

  return (
    <div className={`p-4 ${user.suspended ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 grid place-items-center text-slate-600 font-display font-bold text-xs shrink-0">
          {initials(user.name)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-display font-semibold text-sm text-slate-900">{user.name}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${rolePill}`}>
              {roleLabel}
            </span>
            {user.verified && <Check size={13} className="text-emerald-600" strokeWidth={2.5} />}
            {user.suspended && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-50 text-red-700 flex items-center gap-0.5">
                <ShieldAlert size={10} /> Suspenso
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <p className="text-[10px] text-muted-foreground font-mono-accent mt-0.5">
            Aderiu {user.createdAt} · {user.contributions} contrib. · {user.debatesCount} debates
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={user.role}
            onChange={(e) => changeRole(e.target.value as ApiUser["role"])}
            className="text-xs border border-slate-200 rounded-md px-1.5 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300"
          >
            <option value="user">Utilizador</option>
            <option value="researcher">Pesquisador</option>
            <option value="expert">Especialista</option>
          </select>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Mais ações"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={toggleVerify}
                  className="w-full text-left text-xs px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Check size={13} />
                  {user.verified ? "Desverificar" : "Verificar"}
                </button>
                <button
                  onClick={toggleSuspend}
                  className="w-full text-left text-xs px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <ShieldAlert size={13} />
                  {user.suspended ? "Activar conta" : "Suspender"}
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                  className="w-full text-left text-xs px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 size={13} />
                  Eliminar conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isPending && (
        <div className="mt-3 flex items-center gap-2 pl-3 border-l-2 border-amber-300">
          <UserCheck size={13} className="text-amber-700 shrink-0" />
          <p className="text-xs text-amber-800 flex-1">Candidatura a Pesquisador pendente</p>
          <button
            onClick={approveApplication}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 rounded-md transition-colors"
          >
            Aprovar
          </button>
        </div>
      )}

      {confirmDelete && (
        <div className="mt-3 flex items-center gap-2 pl-3 border-l-2 border-red-300">
          <span className="text-xs text-red-600 flex-1">
            Eliminar a conta de {user.name} permanentemente?
          </span>
          <button
            onClick={() => setConfirmDelete(false)}
            className="text-xs font-semibold text-muted-foreground px-2 py-1 hover:text-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition-colors"
          >
            Eliminar
          </button>
        </div>
      )}
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
      .get<Paginated<ApiUser>>("/admin/users")
      .then((res) => setUsers(res.users ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const matchesFilter = (u: ApiUser, f: FilterKey) => {
    switch (f) {
      case "todos":
        return true;
      case "candidatos":
        return !!u.appliedForResearcher && u.role === "user";
      case "suspensos":
        return u.suspended;
      default:
        return u.role === f;
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchesSearch && matchesFilter(u, filter);
  });

  const counts = filters.reduce<Record<string, number>>((acc, f) => {
    acc[f.id] = users.filter((u) => matchesFilter(u, f.id)).length;
    return acc;
  }, {});

  const updateUser = (id: number, changes: Partial<ApiUser>) =>
    setUsers((xs) => xs.map((u) => (u.id === id ? { ...u, ...changes } : u)));

  const deleteUser = (id: number) => setUsers((xs) => xs.filter((u) => u.id !== id));

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-5">
      <header className="space-y-1">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900">Utilizadores</h1>
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
          className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white"
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

      <div className="flex gap-1 border-b border-slate-200 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`relative px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === f.id ? "text-slate-900" : "text-muted-foreground hover:text-slate-700"
            }`}
          >
            {f.label}
            <span className="ml-1.5 font-mono-accent text-[10px] text-slate-400">
              {counts[f.id]}
            </span>
            {filter === f.id && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-slate-800 rounded-full" />
            )}
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
        <div className="card-app divide-y divide-slate-100">
          {filtered.map((u) => (
            <UserRow key={u.id} user={u} onUpdate={updateUser} onDelete={deleteUser} />
          ))}
        </div>
      )}
    </div>
  );
};
