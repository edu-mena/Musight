import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { debates } from "../../data/debates";
import { articles } from "../../data/articles";
import { MessageSquare, BookOpen, Bot, Headphones, Users, ChevronRight, Zap } from "lucide-react";

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="px-4 py-5 space-y-6">
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-sm">Bom dia,</p>
        <h1 className="font-display font-bold text-2xl">{user?.name?.split(" ")[0]} 👋</h1>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: MessageSquare, label: "Debates", to: "/app/debates", color: "bg-orange-50 text-orange-500" },
          { icon: BookOpen, label: "Artigos", to: "/app/artigos", color: "bg-orange-50 text-orange-500" },
          { icon: Bot, label: "Perguntar à Weza", to: "/app/ia", color: "bg-orange-50 text-orange-500" },
          { icon: Headphones, label: "Girassol Lê", to: "/app/artigos", color: "bg-orange-50 text-orange-500" },
        ].map(({ icon: Icon, label, to, color }) => (
          <Link key={label} to={to} className="card-app p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <span className="font-semibold text-sm">{label}</span>
          </Link>
        ))}
      </div>

      {/* Hot debate */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg flex items-center gap-1.5">🔥 Em destaque</h2>
          <Link to="/app/debates" className="text-xs text-primary font-semibold flex items-center gap-0.5">
            Ver todos <ChevronRight size={12} />
          </Link>
        </div>
        <Link to={`/app/debates/${debates[0].id}`} className="card-app block p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <span className="pill bg-primary/10 text-primary">{debates[0].category}</span>
            <span className="text-[10px] text-muted-foreground font-mono-accent">{debates[0].date}</span>
          </div>
          <h3 className="font-display font-bold text-base leading-snug">{debates[0].title}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{debates[0].summary}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users size={11} className="text-orange-500" />{debates[0].participants}</span>
            <span>{debates[0].experts} especialistas</span>
            <span>{debates[0].comments.length} comentários</span>
          </div>
        </Link>
      </div>

      {/* Latest articles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Últimos artigos</h2>
          <Link to="/app/artigos" className="text-xs text-primary font-semibold flex items-center gap-0.5">
            Ver todos <ChevronRight size={12} />
          </Link>
        </div>
        <div className="space-y-3">
          {articles.slice(0, 2).map((a) => (
            <Link key={a.id} to={`/app/artigos/${a.id}`} className="card-app flex gap-3 p-4 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 shrink-0 flex items-center justify-center">
                <BookOpen size={20} className="text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-mono-accent text-[10px] uppercase text-primary">{a.category}</span>
                <h3 className="font-display font-bold text-sm leading-snug mt-0.5">{a.title}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  {a.audioAvailable && (
                    <span className="flex items-center gap-1 text-[10px] text-orange-500 font-semibold">
                      <Headphones size={10} />Audio {a.audioDuration}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground font-mono-accent">{a.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* IA teaser */}
      <Link to="/app/ia" className="block rounded-2xl p-5 bg-gradient-primary text-white">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={18} />
          <span className="font-display font-bold">Weza</span>
        </div>
        <p className="text-sm text-white/85">Tens dúvidas sobre uma notícia? Pergunta à Weza com contexto e fontes verificadas.</p>
        <div className="flex items-center gap-1 mt-3 text-xs font-semibold">
          Fazer uma pergunta <ChevronRight size={12} />
        </div>
      </Link>

      {/* Stats */}
      <div className="card-app p-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="font-display font-bold text-xl text-primary">{user?.debates}</div>
          <div className="text-[10px] text-muted-foreground font-mono-accent uppercase">Debates</div>
        </div>
        <div className="border-x border-border">
          <div className="font-display font-bold text-xl text-primary">{user?.contributions}</div>
          <div className="text-[10px] text-muted-foreground font-mono-accent uppercase">Contribuições</div>
        </div>
        <div>
          <div className="font-display font-bold text-xl text-primary">
            <Zap size={18} className="inline text-orange-500" />
          </div>
          <div className="text-[10px] text-muted-foreground font-mono-accent uppercase">Activo</div>
        </div>
      </div>
    </div>
  );
};
