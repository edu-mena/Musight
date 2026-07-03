import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, MessageSquare, BookOpen, Bot, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Logo } from "./Logo";

const TABS = [
  { to: "/app", icon: Home, label: "Início" },
  { to: "/app/debates", icon: MessageSquare, label: "Debates" },
  { to: "/app/artigos", icon: BookOpen, label: "Artigos" },
  { to: "/app/ia", icon: Bot, label: "Weza" },
  { to: "/app/perfil", icon: User, label: "Perfil" },
];

export const AppShell = ({ children, title }: { children: ReactNode; title?: string }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
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
        <button
          onClick={handleLogout}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sair
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 pb-nav overflow-y-auto">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-white border-t border-border">
        <div className="flex">
          {TABS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app"}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
                  isActive ? "text-primary" : "text-foreground/40 hover:text-foreground/70"
                }`
              }
            >
              <Icon size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
