import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "../../components/layout/Logo";
import { Loader2, ArrowLeft } from "lucide-react";
import { api } from "../../lib/apiClient";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "O email é obrigatório").email("Email inválido"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async ({ email }: ForgotPasswordInput) => {
    setError("");
    try {
      await api.post<{ message?: string }>("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message || "Não foi possível enviar o pedido.");
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
              <h1 className="font-display font-bold text-2xl">Recuperar palavra-passe</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Digita o teu e-mail e enviaremos um link para redefinir a tua palavra-passe.
              </p>
            </div>

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                Se a conta existir, enviámos um e-mail com as instruções para repor a palavra-passe.
              </div>
            ) : (
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

                {error && <p className="text-sm text-destructive">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Enviar pedido"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
