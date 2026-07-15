import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { Logo } from "../../components/layout/Logo";
import { api } from "../../lib/apiClient";

type Status = "loading" | "success" | "error";

export const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [errorMessage, setErrorMessage] = useState(token ? "" : "Link inválido ou incompleto.");

  useEffect(() => {
    // Sem token não há nada a fazer aqui — o estado inicial já cobre esse caso
    // (evita chamar setState de forma síncrona dentro do efeito).
    if (!token) return;

    api
      .get(`/auth/confirm/${token}`)
      .then(() => setStatus("success"))
      .catch((e) => {
        setStatus("error");
        setErrorMessage((e as Error).message || "Não foi possível confirmar o teu email.");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-surface-darker flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-radial-amber" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo light />
        </div>

        <div className="card-app p-6 text-center space-y-4">
          {status === "loading" && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Loader2 size={28} className="animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="font-display font-bold text-2xl text-foreground">
                  A confirmar o teu email...
                </h1>
                <p className="text-sm text-muted-foreground">Aguarda um momento.</p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={28} />
              </div>
              <div className="space-y-2">
                <h1 className="font-display font-bold text-2xl text-foreground">
                  Email confirmado!
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A tua conta foi verificada com sucesso. Já podes entrar.
                </p>
              </div>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2 mx-auto">
                Ir para o login <ArrowRight size={15} />
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <XCircle size={28} />
              </div>
              <div className="space-y-2">
                <h1 className="font-display font-bold text-2xl text-foreground">
                  Não foi possível confirmar
                </h1>
                <p className="text-sm text-destructive leading-relaxed">{errorMessage}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  O link pode ter expirado (válido por 1 hora). Podes pedir um novo na página de
                  login.
                </p>
              </div>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2 mx-auto">
                Ir para o login <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
