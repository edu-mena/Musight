import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/layout/Logo";
import { Loader2 } from "lucide-react";
import { ExternalLink } from "lucide-react";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError("Preenche todos os campos."); return; }
    if (password.length < 6) { setError("A password deve ter pelo menos 6 caracteres."); return; }
    if (!termsAccepted) { setError("Tens de aceitar os Termos de Uso para continuar."); return; }
    setLoading(true);
    setError("");
    try {
      await register(name, email, password);
      navigate("/app");
    } catch {
      setError("Erro ao criar conta. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-darker flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-radial-amber" />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><Logo light /></div>
          <h1 className="font-display font-bold text-2xl text-white">Cria a tua conta</h1>
          <p className="text-white/60 text-sm mt-1">Gratuito. Sem publicidade.</p>
        </div>

        <div className="card-app p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Nome", value: name, set: setName, type: "text", placeholder: "O teu nome" },
              { label: "Email", value: email, set: setEmail, type: "email", placeholder: "o.teu@email.com" },
              { label: "Password", value: password, set: setPassword, type: "password", placeholder: "Mín. 6 caracteres" },
            ].map(({ label, value, set, type, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-semibold mb-1.5">{label}</label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>
            ))}

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border-2 border-border peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                  {termsAccepted && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button type="submit" disabled={loading || !termsAccepted} className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Criar conta"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Já tens conta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Entra aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
