import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, type ApiArticle } from "../../lib/apiClient";
import { BookOpen, Headphones, ChevronRight, MessageSquareQuote } from "lucide-react";

function Spinner() {
  return (
    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
  );
}

export const Articles = () => {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiArticle[]>("/articles")
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 py-5">
      <h1 className="font-display font-bold text-2xl mb-5">Artigos</h1>

      {loading ? (
        <div className="card-app p-6 flex justify-center">
          <Spinner />
        </div>
      ) : articles.length === 0 ? (
        <div className="card-app p-6 text-center text-sm text-muted-foreground">
          Em breve novos artigos.
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((a) => (
            <Link
              key={a.id}
              to={`/app/artigos/${a.id}`}
              className="card-app flex gap-4 p-4 hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 shrink-0 flex items-center justify-center">
                <BookOpen size={24} className="text-primary/60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono-accent text-[10px] uppercase text-primary">
                    {a.category}
                  </span>
                  {!a.has_references && (
                    <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-semibold">
                      <MessageSquareQuote size={10} /> Opinião
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-sm leading-snug mt-0.5">{a.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="pill bg-secondary text-muted-foreground !py-0.5 !px-2">
                    3 níveis
                  </span>
                  {a.has_audio && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                      <Headphones size={10} /> {a.audio_duration}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono-accent mt-1">{a.date}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0 self-center" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
