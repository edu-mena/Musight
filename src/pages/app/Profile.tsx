import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, MessageSquare, BookOpen, Bell, Shield, ChevronRight, LogOut, Edit2 } from "lucide-react";

const SETTINGS = [
  { icon: Bell, label: "Notificações", desc: "Debates e respostas" },
  { icon: BookOpen, label: "Nível padrão", desc: "Intermédio" },
  { icon: Shield, label: "Privacidade", desc: "Conta pública" },
];

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");

  const handleLogout = () => { logout(); navigate("/"); };

  const initials = user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("") ?? "?";

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-white font-display font-bold text-2xl">
          {initials}
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-border px-3 py-1.5 text-sm font-semibold text-center outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={() => setEditing(false)} className="text-xs text-primary font-semibold">Guardar</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-xl">{name}</h2>
            <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground">
              <Edit2 size={14} />
            </button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        {user?.role === "expert" && (
          <span className="pill bg-blue-50 text-blue-600 border border-blue-100">Especialista verificado</span>
        )}
      </div>

      {/* Stats */}
      <div className="card-app grid grid-cols-3 gap-0 overflow-hidden">
        {[
          { icon: MessageSquare, n: user?.debates, label: "Debates" },
          { icon: User, n: user?.contributions, label: "Contribuições" },
          { icon: BookOpen, n: "3", label: "Artigos lidos" },
        ].map(({ icon: Icon, n, label }, i) => (
          <div key={label} className={`flex flex-col items-center py-4 ${i < 2 ? "border-r border-border" : ""}`}>
            <Icon size={16} className="text-primary mb-1" />
            <div className="font-display font-bold text-xl">{n}</div>
            <div className="text-[10px] text-muted-foreground font-mono-accent uppercase mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Member since */}
      <div className="card-app p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono-accent uppercase tracking-wide">Membro desde</p>
          <p className="font-semibold text-sm mt-0.5">{user?.joinedAt}</p>
        </div>
        <span className="pill bg-primary/10 text-primary">Gratuito</span>
      </div>

      {/* Settings */}
      <div>
        <h3 className="font-display font-bold text-base mb-3">Definições</h3>
        <div className="card-app overflow-hidden divide-y divide-border">
          {SETTINGS.map(({ icon: Icon, label, desc }) => (
            <button key={label} className="w-full flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors text-left">
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
        </div>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full card-app p-4 flex items-center gap-3 text-destructive hover:bg-red-50 transition-colors">
        <LogOut size={16} />
        <span className="font-semibold text-sm">Terminar sessão</span>
      </button>
    </div>
  );
};
