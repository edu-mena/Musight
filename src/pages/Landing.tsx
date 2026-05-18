import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { debates } from "../data/debates";
import { MessageSquare, BookOpen, Bot, Headphones, Lock, ChevronRight, Users, Zap } from "lucide-react";

const FEATURES = [
  { icon: MessageSquare, title: "Debates com Propósito", desc: "Participa em debates sobre as notícias do dia. Especialistas e cidadãos, lado a lado." },
  { icon: BookOpen, title: "Níveis de Explicação", desc: "A mesma notícia em 3 profundidades — do resumo simples à análise técnica." },
  { icon: Zap, title: "Termos-Chave", desc: "Palavras difíceis ficam sublinhadas. Clica para ver a definição sem sair do texto." },
  { icon: Bot, title: "Weza", desc: "Faz perguntas sobre qualquer artigo. A Weza responde com contexto e fontes verificadas." },
  { icon: Headphones, title: "Girassol Lê", desc: "Artigos narrados em áudio. Ouve enquanto vives o teu dia — 3 episódios por semana." },
  { icon: Users, title: "Especialistas Comentam", desc: "Economistas, juristas e médicos explicam o contexto das notícias em primeira mão." },
];

const STATS = [
  { n: "4 800+", label: "Membros" },
  { n: "120+", label: "Debates activos" },
  { n: "38", label: "Especialistas" },
];

export const Landing = () => (
  <div className="bg-background">
    <Navbar />

    {/* ── Hero ── */}
    <section className="relative min-h-[100svh] flex items-center pt-14 overflow-hidden bg-surface-darker">
      <div className="absolute inset-0 bg-radial-amber" />
      <div className="relative max-w-6xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-14 items-center w-full">
        <div className="animate-fade-up text-white">
          <span className="pill bg-white/10 border border-white/15 text-white mb-6">🌻 Rede Girassol · App</span>
          <h1 className="font-display font-bold text-5xl md:text-6xl leading-[1.0]">
            Debate.<br />Aprende.<br />
            <span className="text-gradient">Compreende.</span>
          </h1>
          <p className="mt-6 text-lg text-white/75 max-w-lg">
            O app que te explica Angola e o mundo ao teu nível. Debates com especialistas, artigos com termos-chave interactivos e a Weza para as tuas perguntas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">Criar conta gratuita</Link>
            <Link to="/login" className="btn-ghost border-white/30 !text-white hover:!bg-white hover:!text-foreground">
              Já tenho conta
            </Link>
          </div>
          <div className="mt-10 flex gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-display font-bold text-2xl text-white">{s.n}</div>
                <div className="text-xs text-white/50 font-mono-accent uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center">
          <div className="w-64 h-[500px] rounded-[2.5rem] border-4 border-white/20 bg-white/5 backdrop-blur-sm relative overflow-hidden shadow-2xl">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-1.5 rounded-full bg-white/20" />
            <div className="p-4 pt-8 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <img src="/favicon.png" className="h-6 w-6" alt="" />
                <span className="font-display font-bold text-white text-sm">Gira<b>Sightin</b></span>
              </div>
              {/* Debate card preview */}
              <div className="rounded-xl bg-white/10 border border-white/15 p-3">
                <div className="text-[9px] font-mono-accent uppercase text-orange-300 mb-1">Debate · Economia</div>
                <div className="text-white text-xs font-semibold leading-snug">A subida dos combustíveis é inevitável?</div>
                <div className="mt-2 flex gap-2 text-[9px] text-white/50">
                  <span>312 participantes</span><span>·</span><span>4 especialistas</span>
                </div>
              </div>
              {/* Article preview */}
              <div className="rounded-xl bg-white/10 border border-white/15 p-3">
                <div className="text-[9px] font-mono-accent uppercase text-orange-300 mb-1">Artigo</div>
                <div className="text-white text-xs font-semibold leading-snug">BNA sobe taxa para 19,5%</div>
                <div className="mt-2 flex items-center gap-1 text-[9px]">
                  <span className="px-1.5 py-0.5 rounded-full bg-orange-500/30 text-orange-200">Básico</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">Intermédio</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">Avançado</span>
                </div>
              </div>
              {/* IA preview */}
              <div className="rounded-xl bg-white/10 border border-white/15 p-3">
                <div className="flex gap-2 items-start">
                  <Bot size={12} className="text-orange-300 mt-0.5 shrink-0" />
                  <div className="text-[10px] text-white/70">O que é a taxa BNA e como me afecta?</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Features ── */}
    <section className="py-20 px-5 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="font-mono-accent text-xs uppercase tracking-wider text-primary">Funcionalidades</span>
        <h2 className="font-display font-bold text-3xl md:text-4xl mt-2">Mais do que notícias.<br /><span className="text-gradient">Compreensão.</span></h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card-app p-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Icon size={20} className="text-primary" />
            </div>
            <h3 className="font-display font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* ── Debates preview (bloqueados) ── */}
    <section className="py-20 px-5 max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="font-mono-accent text-xs uppercase tracking-wider text-primary">Últimos debates</span>
          <h2 className="font-display font-bold text-3xl mt-1">Em destaque <span className="text-gradient">agora</span></h2>
        </div>
        <Link to="/register" className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
          Ver todos <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-4 relative">
        {/* First debate — visible */}
        <div className="card-app p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="pill bg-primary/10 text-primary">{debates[0].category}</span>
                {debates[0].hot && <span className="pill bg-red-50 text-red-500">🔥 Em alta</span>}
              </div>
              <h3 className="font-display font-bold text-base leading-snug">{debates[0].title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{debates[0].summary}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users size={12} />{debates[0].participants} participantes</span>
                <span>{debates[0].experts} especialistas</span>
              </div>
            </div>
          </div>
          {/* 1 comment visible */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                {debates[0].comments[0].author[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className="font-bold">{debates[0].comments[0].author}</span>
                  <span className="text-muted-foreground">{debates[0].comments[0].role}</span>
                  {debates[0].comments[0].isExpert && <span className="pill bg-blue-50 text-blue-600 !py-0.5">Especialista</span>}
                </div>
                <p className="text-sm text-muted-foreground">{debates[0].comments[0].text}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Remaining debates — blurred + lock */}
        <div className="relative">
          <div className="space-y-4 blur-sm pointer-events-none select-none">
            {debates.slice(1, 3).map((d) => (
              <div key={d.id} className="card-app p-5">
                <span className="pill bg-primary/10 text-primary mb-2 inline-flex">{d.category}</span>
                <h3 className="font-display font-bold text-base leading-snug">{d.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{d.participants} participantes</span>
                  <span>{d.experts} especialistas</span>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-background via-background/80 to-transparent rounded-2xl">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-foreground/5 border border-border flex items-center justify-center mx-auto mb-3">
                <Lock size={20} className="text-muted-foreground" />
              </div>
              <p className="font-display font-bold text-lg mb-1">Cria uma conta para ver mais</p>
              <p className="text-sm text-muted-foreground mb-5">Acesso gratuito a todos os debates, artigos e à Weza.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="btn-primary">Criar conta — é grátis</Link>
                <Link to="/login" className="btn-ghost">Já tenho conta</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── CTA final ── */}
    <section className="py-20 px-5">
      <div className="max-w-2xl mx-auto text-center bg-surface-darker rounded-3xl p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-amber" />
        <div className="relative">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-white">Junta-te à conversa.</h2>
          <p className="mt-3 text-white/70 text-lg">Registo gratuito. Sem publicidade. Feito para Angola.</p>
          <Link to="/register" className="btn-primary mt-8 inline-flex">Começar agora</Link>
        </div>
      </div>
    </section>

    <footer className="bg-surface-darker text-white/50 py-8 px-5 text-center text-sm">
      <div className="flex items-center justify-center gap-2 mb-3">
        <img src="/favicon.png" className="h-6 w-6" alt="" />
        <span className="font-display text-white">Gira<b>Sightin</b></span>
      </div>
      <p>© {new Date().getFullYear()} Rede Girassol. Todos os direitos reservados.</p>
    </footer>
  </div>
);
