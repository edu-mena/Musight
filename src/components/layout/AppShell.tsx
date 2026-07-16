import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  BookOpen,
  Bot,
  Plus,
  Menu,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "./Logo";

// Apenas os 4 destinos principais ficam na barra inferior — Perfil passou
// para o menu hamburguer no topo.
const TABS = [
  { to: "/app", icon: Home, label: "Início" },
  { to: "/app/debates", icon: MessageSquare, label: "Debates" },
  { to: "/app/artigos", icon: BookOpen, label: "Artigos" },
  { to: "/app/ia", icon: Bot, label: "Weza" },
];

export const AppShell = ({ children, title }: { children: ReactNode; title?: string }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/");
  };

  const goToProfile = () => {
    setMenuOpen(false);
    navigate("/app/perfil");
  };

  const goToSettings = () => {
    setMenuOpen(false);
    // Ainda não existe uma rota dedicada de configurações — a secção
    // "Definições" já vive dentro do Perfil, por isso aponta para lá.
    navigate("/app/perfil");
  };

  // Botão "+": pesquisadores vão directo para o painel de pesquisador.
  // Quem não é pesquisador é levado ao Perfil com o pedido de candidatura
  // já accionado (ver Profile.tsx, que lê o parâmetro ?openWriterModal=1).
  const handlePlusClick = () => {
    if (user?.role === "researcher") {
      navigate("/researcher");
    } else {
      navigate("/app/perfil?openWriterModal=1");
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-background relative">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border px-4 h-14 flex items-center justify-between shrink-0">
        <Logo size="sm" />
        {title && (
          <span className="font-display font-bold text-base absolute left-1/2 -translate-x-1/2">
            {title}
          </span>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Menu size={19} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50">
              <button
                onClick={goToProfile}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/60 transition-colors text-left"
              >
                <User size={15} className="text-muted-foreground" />
                Perfil
              </button>
              <button
                onClick={goToSettings}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary/60 transition-colors text-left border-t border-border"
              >
                <Settings size={15} className="text-muted-foreground" />
                Configurações
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-destructive hover:bg-red-50 transition-colors text-left border-t border-border"
              >
                <LogOut size={15} />
                Terminar sessão
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-nav overflow-y-auto">{children}</main>

      {/* Bottom navigation — pill flutuante + botão "+" separado */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40 flex items-center gap-2.5">
        <nav className="flex-1 flex items-center justify-around bg-white rounded-full shadow-lg shadow-black/10 px-1.5 py-1.5">
          {TABS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-3.5 py-2 rounded-full transition-colors ${
                  isActive ? "bg-primary text-white" : "text-slate-500 hover:text-slate-700"
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handlePlusClick}
          aria-label="Criar"
          className="w-12 h-12 rounded-full bg-foreground text-white flex items-center justify-center shadow-lg shadow-black/20 shrink-0 hover:opacity-90 transition-opacity"
        >
          <Plus size={22} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};
