import { useState } from "react";
import { PenLine, Globe, ArrowRight, CheckCircle2, X } from "lucide-react";

interface Props {
  onConfirm: (data: { focusArea: string; motivation: string; portfolioUrl: string }) => void;
  onClose: () => void;
}

const FOCUS_AREAS = [
  "Jornalismo Cívico",
  "Investigação Académica",
  "Análise Económica",
  "Análise Política",
  "Saúde Pública",
  "Direito & Legislação",
  "Ambiente & Sustentabilidade",
  "Cultura & Sociedade",
  "Ciência & Tecnologia",
  "Activismo Cívico",
];

const COMMITMENTS = [
  "Publico conteúdo baseado em factos verificáveis e com fontes identificadas.",
  "Identifico claramente quando se trata de opinião e não de reportagem.",
  "Respeito os princípios editoriais e a comunidade GiraSightin.",
  "Aceito que o meu conteúdo seja revisto e, se necessário, removido pela equipa editorial.",
];

export const WriterApplicationModal = ({ onConfirm, onClose }: Props) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [focusArea, setFocusArea] = useState("");
  const [motivation, setMotivation] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [agreed, setAgreed] = useState(false);

  const canSubmit = focusArea && motivation.trim().length >= 20 && agreed;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirm({ focusArea, motivation, portfolioUrl });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col">
        {/* Handle + close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1 shrink-0">
          <div className="flex gap-1.5">
            {[1, 2].map((n) => (
              <span
                key={n}
                className={`h-1 rounded-full transition-all duration-300 ${
                  n === step ? "w-6 bg-primary" : "w-3 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="px-5 pt-2 pb-7">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                <PenLine size={22} className="text-violet-600" />
              </div>
              <h2 className="font-display font-bold text-xl leading-snug mb-1">
                Torna-te Leitor / Pesquisador
              </h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Como pesquisador podes publicar artigos e análises na plataforma.
                O teu estatuto passa de simples leitor para voz activa na comunidade.
              </p>

              <div className="space-y-4 mb-6">
                {[
                  {
                    icon: PenLine,
                    title: "Publica os teus próprios artigos",
                    body: "Cria conteúdo jornalístico, académico ou de opinião visível para toda a comunidade.",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Badge de Pesquisador no perfil",
                    body: "O teu perfil ganha o selo de Leitor / Pesquisador, distinguindo-te dos leitores comuns.",
                  },
                  {
                    icon: Globe,
                    title: "Contribui para o jornalismo cívico angolano",
                    body: "As tuas análises ajudam os cidadãos a compreender melhor o que se passa no país.",
                  },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={15} className="text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-2xl bg-violet-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors"
              >
                Quero candidatar-me <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="px-5 pt-2 pb-7 space-y-4">
              <div>
                <p className="font-display font-bold text-lg leading-snug mb-0.5">A tua candidatura</p>
                <p className="text-sm text-muted-foreground">Preenche os dados abaixo para concluir.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Área de foco principal *
                </label>
                <select
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400/40 bg-background"
                >
                  <option value="">Seleccionar área</option>
                  {FOCUS_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Motivação *
                </label>
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value.slice(0, 280))}
                  placeholder="Por que queres publicar na GiraSightin? O que tens para contribuir? (mín. 20 caracteres)"
                  rows={4}
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400/40 resize-none"
                />
                <p className="text-right text-[10px] text-muted-foreground mt-0.5">{motivation.length}/280</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Portfólio ou trabalhos anteriores
                  <span className="ml-1 text-muted-foreground/60 normal-case">(opcional)</span>
                </label>
                <input
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                  className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-400/40"
                />
              </div>

              <div className="card-app p-4 space-y-3 bg-secondary/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">O teu compromisso editorial</p>
                {COMMITMENTS.map((line) => (
                  <div key={line} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="text-violet-600 shrink-0 mt-0.5" />
                    <p className="text-sm leading-snug">{line}</p>
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-border peer-checked:border-violet-600 peer-checked:bg-violet-600 transition-all flex items-center justify-center">
                    {agreed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground leading-snug">
                  Li e aceito o compromisso editorial acima descrito.
                </span>
              </label>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3 rounded-2xl bg-violet-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-700 transition-colors"
              >
                Submeter candidatura
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
