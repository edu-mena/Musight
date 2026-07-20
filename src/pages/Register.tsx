import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/layout/Logo";
import { Loader2, ExternalLink } from "lucide-react";
import { registerSchema, type RegisterInput } from "../lib/validation/auth";

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { termsAccepted: false },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError("");
    try {
      await registerUser(data.name, data.email, data.password);
      navigate("/verify-email", { state: { email: data.email } });
    } catch (e) {
      setError((e as Error).message || "Erro ao criar conta. Tenta novamente.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError("");
    const apiBase =
      import.meta.env.VITE_API_URL || "https://rosybrown-wasp-975017.hostingersite.com";

    try {
      const res = await fetch(`${apiBase.replace(/\/$/, "")}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const responseData = await res.json().catch(() => ({}));

      if (res.ok) {
        navigate("/app");
      } else {
        setError(responseData.message || "Erro ao registar conta com a Google.");
      }
    } catch {
      setError("Falha na comunicação com o servidor de autenticação.");
    }
  };

  return (
    <div className="min-h-screen bg-surface-darker flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-radial-amber" />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo light />
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Cria a tua conta</h1>
          <p className="text-white/60 text-sm mt-1">Forever Free. Sem publicidade.</p>
        </div>

        <div className="card-app p-6">
          <div className="w-full flex justify-center mb-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Erro ao registar com a Google.")}
              theme="outline"
              size="large"
              width="340"
            />
          </div>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-border/40"></div>
            <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-wider">
              ou
            </span>
            <div className="flex-grow border-t border-border/40"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Nome</label>
              <input
                type="text"
                placeholder="O teu nome"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Email</label>
              <input
                type="email"
                placeholder="o.teu@email.com"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Mín. 6 caracteres"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input type="checkbox" className="sr-only peer" {...register("termsAccepted")} />
                <div className="w-5 h-5 rounded-md border-2 border-border peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                  {watch("termsAccepted") && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm text-muted-foreground leading-snug">
                Li e aceito os{" "}
                <a
                  href="/politicas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline inline-flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  Termos de Uso e Política de Privacidade
                  <ExternalLink size={11} className="inline" />
                </a>
              </span>
            </label>
            {errors.termsAccepted && (
              <p className="text-sm text-destructive -mt-2">{errors.termsAccepted.message}</p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Já tens conta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Entra aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
