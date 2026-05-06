import { useState } from "react";
import { Link } from "react-router-dom";
import { debates } from "../../data/debates";
import { Users, ChevronRight } from "lucide-react";

const CATS = ["Todos", "Economia", "Política", "Saúde", "Educação"];

export const Debates = () => {
  const [cat, setCat] = useState("Todos");
  const filtered = cat === "Todos" ? debates : debates.filter((d) => d.category === cat);

  return (
    <div className="px-4 py-5">
      <h1 className="font-display font-bold text-2xl mb-4">Debates</h1>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`pill shrink-0 border transition-all ${cat === c ? "bg-foreground text-white border-foreground" : "border-border text-muted-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Debate list */}
      <div className="space-y-4">
        {filtered.map((d) => (
          <Link key={d.id} to={`/app/debates/${d.id}`} className="card-app block p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="pill bg-primary/10 text-primary">{d.category}</span>
                {d.hot && <span className="pill bg-red-50 text-red-500">🔥</span>}
                <span className="text-[10px] text-muted-foreground font-mono-accent">{d.date}</span>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-1" />
            </div>
            <h3 className="font-display font-bold text-base leading-snug">{d.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{d.summary}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users size={11} />{d.participants}</span>
              <span>{d.experts} especialistas</span>
              <span>{d.comments.length} comentários</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
