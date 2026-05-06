import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export const Navbar = () => (
  <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border">
    <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-2">
        <Link to="/login" className="text-sm font-semibold text-foreground/70 px-4 py-2 hover:text-foreground transition-colors">
          Entrar
        </Link>
        <Link to="/register" className="btn-primary !py-2 !px-5 !text-xs">
          Criar conta
        </Link>
      </div>
    </div>
  </header>
);
