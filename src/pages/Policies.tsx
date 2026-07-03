import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Logo } from "../components/layout/Logo";

const PDF_SRC = "/SIGHTIN_Documentacao_Legal_Oficial.pdf";

export const Policies = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border px-4 h-14 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <Logo size="sm" />
        <span className="font-display font-bold text-base flex-1">Políticas & Privacidade</span>
        <a
          href={PDF_SRC}
          download
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Descarregar PDF"
        >
          <Download size={18} />
        </a>
      </header>

      <main className="flex-1 flex flex-col">
        <iframe
          src={PDF_SRC}
          className="flex-1 w-full border-0"
          style={{ minHeight: "calc(100vh - 3.5rem)" }}
          title="Documentação Legal GiraSightin"
        />
        <div className="px-4 py-3 text-center border-t border-border">
          <a href={PDF_SRC} download className="text-sm text-primary font-semibold hover:underline">
            Descarregar documento completo (PDF)
          </a>
        </div>
      </main>
    </div>
  );
};
