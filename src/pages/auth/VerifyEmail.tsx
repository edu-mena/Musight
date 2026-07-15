import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MailCheck, ArrowRight } from "lucide-react";
import { Logo } from "../../components/layout/Logo";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface-darker flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-radial-amber" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo light />
        </div>

        <div className="card-app p-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <MailCheck size={28} />
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-bold text-2xl text-foreground">
              Verifica o teu e-mail
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enviámos um link de confirmação para o teu endereço{email ? ` (${email})` : ""}. Abre
              o e-mail e confirma a tua conta para poderes entrar.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            Depois desta confirmação, serás redirecionado para a página de login automaticamente.
          </div>

          <Link to="/login" className="btn-primary inline-flex items-center gap-2 mx-auto">
            Ir para o login <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};
