import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "../../components/layout/Logo";
import { Loader2, ArrowLeft } from "lucide-react";
import { api } from "../../lib/apiClient";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "A password deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirma a password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As passwords não coincidem",
    path: ["confirmPassword"],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async ({ password }: ResetPasswordInput) => {
    setError("");
    if (!token) {
      setError("Token inválido ou ausente.");
      return;
    }

    try {
      await api.post<{ message?: string }>("/auth/reset-password", { token, password });
      setSuccess(true);
      window.setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (e) {
      setError((e as Error).message || "Não foi possível repor a password.");
    }
  };

  return (
    <div className="min-h-screen bg-surface-darker flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-radial-amber" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo light />
        </div>

        <div className="card-app p-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} /> Voltar ao login
          </Link>

          <div className="mt-4 space-y-4">
            <div>
              <h1 className="font-display font-bold text-2xl">Repõe a palavra-passe</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Escolhe uma nova palavra-passe para a tua conta.
              </p>
            </div>

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                A palavra-passe foi reposta com sucesso. A redirecionar para o login...
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Nova palavra-passe</label>
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

                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Confirmar palavra-passe
                  </label>
                  <input
                    type="password"
                    placeholder="Repete a password"
                    className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Repor password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
