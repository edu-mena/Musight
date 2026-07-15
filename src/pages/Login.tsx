import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/layout/Logo";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, type LoginInput } from "../lib/validation/auth";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError("");
    try {
      await login(data.email, data.password);
      navigate("/app");
    } catch (e) {
      setError((e as Error).message || "Erro ao entrar. Tenta novamente.");
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
          <h1 className="font-display font-bold text-2xl text-white">Bem-vindo de volta</h1>
          <p className="text-white/60 text-sm mt-1">Entra na tua conta MuSight</p>
        </div>

        <div className="card-app p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-11"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Entrar"}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-5 space-y-2">
            <Link
              to="/auth/forgot-password"
              className="text-primary font-semibold hover:underline block"
            >
              Esqueci-me da palavra-passe
            </Link>
            <p>
              Não tens conta?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Cria uma aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
