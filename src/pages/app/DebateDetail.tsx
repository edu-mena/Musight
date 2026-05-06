import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { debates } from "../../data/debates";
import { ChevronLeft, ThumbsUp, Users, Send } from "lucide-react";

export const DebateDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const debate = debates.find((d) => d.id === id);
  const [comment, setComment] = useState("");
  const [side, setSide] = useState<"favor" | "contra" | "neutro">("neutro");
  const [submitted, setSubmitted] = useState(false);

  if (!debate) return (
    <div className="px-4 py-8 text-center">
      <p className="text-muted-foreground">Debate não encontrado.</p>
      <Link to="/app/debates" className="text-primary font-semibold mt-2 inline-block">Voltar</Link>
    </div>
  );

  const handleSubmit = () => {
    if (!comment.trim()) return;
    setSubmitted(true);
    setComment("");
  };

  const sideColors = {
    favor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    contra: "bg-red-50 text-red-700 border-red-200",
    neutro: "bg-secondary text-foreground border-border",
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 bg-white/95 backdrop-blur-sm border-b border-border px-4 py-3 z-10">
        <Link to="/app/debates" className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <ChevronLeft size={15} /> Debates
        </Link>
        <span className="pill bg-primary/10 text-primary">{debate.category}</span>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Title + stats */}
        <div>
          <h1 className="font-display font-bold text-xl leading-snug">{debate.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{debate.summary}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users size={11} />{debate.participants} participantes</span>
            <span>{debate.experts} especialistas</span>
          </div>
        </div>

        {/* Comments */}
        <div>
          <h2 className="font-display font-bold text-base mb-3">Contribuições</h2>
          <div className="space-y-3">
            {debate.comments.map((c) => (
              <div key={c.id} className={`card-app p-4 border-l-4 ${c.side === "favor" ? "border-l-emerald-400" : c.side === "contra" ? "border-l-red-400" : "border-l-border"}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold ${c.isExpert ? "bg-gradient-primary" : "bg-muted"}`}>
                    {c.isExpert ? c.author.split(" ").pop()?.[0] : c.author[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5 mb-1">
                      <span className="font-bold text-xs">{c.author}</span>
                      {c.isExpert && <span className="pill bg-blue-50 text-blue-600 !py-0.5 !px-2">Especialista</span>}
                      <span className="text-[10px] text-muted-foreground ml-auto">{c.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground italic mb-1">{c.role}</p>
                    <p className="text-sm leading-relaxed">{c.text}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <ThumbsUp size={11} /> {c.likes}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add comment */}
        {submitted ? (
          <div className="card-app p-4 text-center">
            <p className="font-semibold text-emerald-600">✓ Contribuição enviada!</p>
            <p className="text-sm text-muted-foreground mt-1">A tua opinião será revisada pela redacção.</p>
          </div>
        ) : (
          <div className="card-app p-4 space-y-3">
            <h3 className="font-display font-bold text-sm">A tua posição, {user?.name?.split(" ")[0]}</h3>
            <div className="flex gap-2">
              {(["favor", "contra", "neutro"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${side === s ? sideColors[s] : "border-border text-muted-foreground"}`}
                >
                  {s === "favor" ? "A favor" : s === "contra" ? "Contra" : "Neutro"}
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escreve o teu argumento..."
              rows={3}
              className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <button onClick={handleSubmit} disabled={!comment.trim()} className="btn-primary w-full !py-2.5">
              <Send size={14} /> Contribuir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
