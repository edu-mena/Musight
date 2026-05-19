import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, type ApiDebate } from "../../lib/apiClient";
import { Users, ChevronRight } from "lucide-react";

const CATS = ["Todos", "Economia", "Política", "Saúde", "Educação"];

function Spinner() {
  return <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />;
}

export const Debates = () => {
  const [debates, setDebates] = useState<ApiDebate[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("Todos");

  useEffect(() => {
    api.get<ApiDebate[]>("/debates")
      .then(setDebates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = cat === "Todos" ? debates : debates.filter((d) => d.category === cat);

  return (
    <div className="px-4 py-5">
      <h1 className="font-display font-bold text-2xl mb-4">Debates</h1>

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

      {loading ? (
        <div className="card-app p-6 flex justify-center"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="card-app p-6 text-center text-sm text-muted-foreground">
          {debates.length === 0 ? "Em breve novos debates." : "Sem debates nesta categoria."}
        </div>
      ) : (
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
                <span>{d.comment_count ?? 0} comentários</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
