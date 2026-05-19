import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, FileText, MessageSquare, ArrowLeft, Shield } from "lucide-react";
import { Toaster } from "sonner";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/utilizadores", label: "Utilizadores", icon: Users },
  { to: "/admin/artigos", label: "Artigos", icon: FileText },
  { to: "/admin/debates", label: "Debates", icon: MessageSquare },
];

export const AdminShell = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-30 h-14 px-4 flex items-center justify-between border-b border-border bg-white/95 backdrop-blur-sm">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 grid place-items-center">
            <Shield size={16} className="text-white" strokeWidth={2} />
          </div>
          <span className="font-display font-bold text-base">GiraSightin</span>
        </Link>
        <span className="pill bg-slate-100 text-slate-700">Administrador</span>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-border bg-white">
          <div className="p-5 border-b border-border">
            <Link to="/admin" className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 grid place-items-center">
                <Shield size={18} className="text-white" strokeWidth={2} />
              </div>
              <span className="font-display font-bold text-lg">GiraSightin</span>
            </Link>
            <span className="pill bg-slate-100 text-slate-700">Painel de Administração</span>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.to, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "bg-slate-100 text-slate-800 border-l-2 border-slate-700"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <button
              type="button"
              onClick={() => navigate("/app")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
              <span>Ir para a leitura</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 h-16 border-t border-border bg-white/95 backdrop-blur-sm grid grid-cols-4">
        {navItems.map((item) => {
          const active = isActive(item.to, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] font-mono-accent transition-colors ${
                active ? "text-slate-800" : "text-muted-foreground"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      <Toaster position="top-center" />
    </div>
  );
};
