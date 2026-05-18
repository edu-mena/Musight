import { X, Bot, AlertCircle } from "lucide-react";

interface AIResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  response: string | null;
  error: string | null;
  context: string;
}

export const AIResponseModal = ({
  isOpen,
  onClose,
  loading,
  response,
  error,
  context,
}: AIResponseModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative w-full bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
            <Bot size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm">Weza</p>
            <p className="text-[10px] text-muted-foreground truncate">{context}</p>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <Bot size={22} className="text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">A Weza está a analisar…</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {response && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {response}
            </p>
          )}
        </div>

        {/* Footer */}
        {(response || error) && (
          <div className="px-4 py-3 border-t border-border shrink-0">
            <button onClick={onClose} className="btn-primary w-full !py-2.5">
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
