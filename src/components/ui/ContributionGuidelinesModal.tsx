import { CheckCircle2, ArrowRight, Shield, BookOpen, Heart } from "lucide-react";

interface Props {
  step: 1 | 2;
  onNext: () => void;
  onAgree: () => void;
}

const STEP1 = [
  {
    icon: BookOpen,
    title: "Seja factual",
    body: "Fundamenta os teus argumentos em factos verificáveis. Evita boatos, generalizações e informação sem fonte.",
  },
  {
    icon: Shield,
    title: "Evita jargões",
    body: "Escreve de forma clara e acessível. O debate ganha quando toda a gente consegue entender o teu ponto de vista.",
  },
  {
    icon: Heart,
    title: "Respeita sempre",
    body: "Opiniões diferentes são bem-vindas. Critica ideias, nunca pessoas. Comentários ofensivos serão removidos.",
  },
];

export const ContributionGuidelinesModal = ({ step, onNext, onAgree }: Props) => (
  <div className="fixed inset-0 z-50 flex flex-col justify-end">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

    <div className="relative w-full bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300">
      {/* Step indicator */}
      <div className="flex justify-center gap-1.5 pt-4 pb-1">
        {[1, 2].map((n) => (
          <span
            key={n}
            className={`h-1 rounded-full transition-all duration-300 ${
              n === step ? "w-6 bg-primary" : "w-3 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {step === 1 ? (
        <div className="px-5 pt-3 pb-6">
          <p className="font-display font-bold text-lg leading-snug mb-1">Antes de contribuir</p>
          <p className="text-sm text-muted-foreground mb-5">
            O debate é mais rico quando todos seguem estas orientações.
          </p>

          <div className="space-y-4">
            {STEP1.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={15} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onNext}
            className="btn-primary w-full mt-6 !py-3 flex items-center justify-center gap-2"
          >
            Continuar <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div className="px-5 pt-3 pb-6">
          <p className="font-display font-bold text-lg leading-snug mb-1">O teu compromisso</p>
          <p className="text-sm text-muted-foreground mb-5">
            Ao contribuir aceitas as regras da comunidade Girassol.
          </p>

          <div className="card-app p-4 space-y-3 bg-secondary/60">
            {[
              "Escrevo com base em factos e fontes verificáveis.",
              "Uso linguagem clara, sem jargões técnicos desnecessários.",
              "Respeito os outros participantes, mesmo quando discordo.",
              "Aceito que contribuições ofensivas ou falsas sejam removidas.",
            ].map((line) => (
              <div key={line} className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                <p className="text-sm leading-snug">{line}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onAgree}
            className="btn-primary w-full mt-5 !py-3"
          >
            Concordo e quero contribuir
          </button>
        </div>
      )}
    </div>
  </div>
);
