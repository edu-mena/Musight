import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, type ApiArticle } from "../../lib/apiClient";
import { BookOpen, Headphones, ChevronRight } from "lucide-react";

function Spinner() {
  return (
    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
  );
}

// Garante que URLs vindas da API sempre tenham protocolo. O backend às vezes
// devolve "host/caminho" sem "https://" na frente, o que faz o navegador
// tratar como caminho relativo e falhar ao carregar.
function withProtocol(url: string | null | undefined): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export const Articles = () => {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ articles: ApiArticle[]; total: number; page: number; limit: number }>("/articles")
      .then((res) => setArticles(res.articles))
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
          {articles.map((a) => {
            const thumb = withProtocol(a.image);
            return (
              <Link
                key={a.id}
                to={`/app/artigos/${a.id}`}
                className="card-app flex gap-4 p-4 hover:shadow-md transition-shadow"
              >
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 shrink-0 flex items-center justify-center overflow-hidden">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={a.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // se a imagem falhar, esconde e deixa o placeholder do ícone aparecer
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = "none";
                        img.parentElement?.classList.add("show-fallback-icon");
                      }}
                    />
                  ) : (
                    <BookOpen size={24} className="text-primary/60" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono-accent text-[10px] uppercase text-primary">
                      {a.category}
                    </span>
                    {/*
                      O badge "Opinião" (baseado em a.references) foi removido daqui de propósito:
                      `references` só vem preenchido em GET /articles/:id (detalhe), nunca em
                      GET /articles (lista) — mostrá-lo aqui marcava TODOS os artigos como
                      "Opinião", mesmo os que tinham referências. Se este selo for importante
                      na listagem, o backend precisa devolver uma contagem (_count) na query
                      de listagem — falar com o backend antes de reintroduzir isto aqui.
                    */}
                  </div>
                  <h3 className="font-display font-bold text-sm leading-snug mt-0.5">{a.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="pill bg-secondary text-muted-foreground !py-0.5 !px-2">
                      3 níveis
                    </span>
                    {a.hasAudio && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                        <Headphones size={10} /> {a.audioDuration}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono-accent mt-1">
                    {a.articleDate}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0 self-center" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
