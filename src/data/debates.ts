export interface Comment {
  id: string;
  author: string;
  role: string;
  isExpert: boolean;
  text: string;
  likes: number;
  side: "favor" | "contra" | "neutro";
  time: string;
}

export interface Debate {
  id: string;
  category: string;
  title: string;
  summary: string;
  participants: number;
  experts: number;
  comments: Comment[];
  date: string;
  hot: boolean;
}

export const debates: Debate[] = [
  {
    id: "d1",
    category: "Economia",
    title: "A subida dos combustíveis é inevitável ou há alternativas?",
    summary: "O governo angolano anunciou nova revisão dos preços dos combustíveis. Economistas dividem-se sobre o impacto para as famílias.",
    participants: 312,
    experts: 4,
    date: "Hoje",
    hot: true,
    comments: [
      { id: "c1", author: "Dr. Manuel Fonseca", role: "Economista · UCAN", isExpert: true, text: "A dessubsidiação é necessária para equilibrar as contas públicas. O modelo actual é insustentável a longo prazo e cria distorções no mercado.", likes: 47, side: "favor", time: "2h" },
      { id: "c2", author: "Maria João Ferreira", role: "Professora", isExpert: false, text: "O salário mínimo não acompanhou a inflação. Este aumento vai afectar desproporcionalmente quem menos tem. Precisamos de compensações sociais antes de subir preços.", likes: 89, side: "contra", time: "3h" },
      { id: "c3", author: "Dr.ª Catarina Neto", role: "Analista Financeira", isExpert: true, text: "Há alternativas graduais — subsídios direccionados aos mais vulneráveis em vez de subsídios universais ao combustível que beneficiam maioritariamente quem tem carro.", likes: 63, side: "neutro", time: "4h" },
    ],
  },
  {
    id: "d2",
    category: "Política",
    title: "O sistema eleitoral angolano precisa de reforma urgente?",
    summary: "Com as eleições de 2027 à vista, especialistas debatem se o sistema de listas fechadas deve ser substituído por círculos uninominais.",
    participants: 198,
    experts: 3,
    date: "Ontem",
    hot: true,
    comments: [
      { id: "c4", author: "Prof. Arnaldo Santos", role: "Constitucionalista · FDUAN", isExpert: true, text: "Os círculos uninominais aproximam o eleitor do representante. É uma reforma estrutural necessária para a maturidade democrática.", likes: 34, side: "favor", time: "1d" },
      { id: "c5", author: "Simão Lemos", role: "Estudante de Direito", isExpert: false, text: "O problema não é o sistema, é a cultura política. Com uninominais podemos ter mais clientelismo local, não menos.", likes: 28, side: "contra", time: "1d" },
    ],
  },
  {
    id: "d3",
    category: "Saúde",
    title: "Vacinação obrigatória: direito ou imposição?",
    summary: "Angola discute a obrigatoriedade de vacinas no calendário nacional. Onde termina a saúde pública e começa a liberdade individual?",
    participants: 156,
    experts: 2,
    date: "3 dias",
    hot: false,
    comments: [
      { id: "c6", author: "Dra. Filomena Cruz", role: "Médica de Saúde Pública", isExpert: true, text: "A imunidade de grupo só é alcançada com taxas de cobertura superiores a 90%. A obrigatoriedade é um instrumento legítimo de saúde pública.", likes: 52, side: "favor", time: "3d" },
    ],
  },
  {
    id: "d4",
    category: "Educação",
    title: "O ensino em português é barreira para o sucesso escolar?",
    summary: "Investigadores questionam se a língua de instrução afecta o aproveitamento de alunos cujas línguas maternas são o Kimbundu, Umbundu ou outras.",
    participants: 243,
    experts: 5,
    date: "4 dias",
    hot: false,
    comments: [
      { id: "c7", author: "Dra. Conceição Maia", role: "Linguista · ISCED", isExpert: true, text: "Estudos em contextos africanos similares mostram que o ensino na língua materna nos primeiros anos melhora significativamente os resultados a longo prazo.", likes: 71, side: "favor", time: "4d" },
    ],
  },
];
