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
    title: "Retirada dos Subsídios: Porquê agora e qual o impacto real?",
    summary:
      "O processo de reforma dos preços dos combustíveis visa corrigir distorções macroeconómicas graves. Especialistas explicam o modelo de transição.",
    participants: 892,
    experts: 8,
    date: "Hoje",
    hot: true,
    comments: [
      {
        id: "c101",
        author: "António Paim",
        role: "Taxista",
        isExpert: false,
        text: "Se o combustível sobe, o preço da corrida também sobe. Como é que o governo espera que a gente sobreviva sem o subsídio no gasóleo?",
        likes: 120,
        side: "contra",
        time: "45min",
      },
      {
        id: "c102",
        author: "Dr. Armindo Costa",
        role: "Consultor de Macroeconomia",
        isExpert: true,
        text: "É importante esclarecer que o Estado gastava cerca de 2 biliões de Kwanzas anuais em subsídios que beneficiavam o contrabando transfronteiriço. A reforma prevê a manutenção do preço para o sector produtivo (agricultura e pescas) e o reforço do Kwenda, que injecta liquidez directamente nas famílias que realmente precisam, evitando o desperdício de recursos públicos.",
        likes: 340,
        side: "favor",
        time: "30min",
      },
    ],
  },
  {
    id: "d2",
    category: "Política",
    title: "Institucionalização das Autarquias: O modelo do Gradualismo",
    summary:
      "O debate sobre as eleições autárquicas foca na prontidão das infraestruturas e na sustentabilidade financeira dos novos municípios.",
    participants: 567,
    experts: 5,
    date: "Ontem",
    hot: true,
    comments: [
      {
        id: "c201",
        author: "Lucas Vunge",
        role: "Estudante de Ciência Política",
        isExpert: false,
        text: "Por que não fazer as eleições em todos os municípios ao mesmo tempo? Não é um direito constitucional?",
        likes: 88,
        side: "neutro",
        time: "2h",
      },
      {
        id: "c202",
        author: "Dra. Isilda Gourgel",
        role: "Jurista e Constitucionalista",
        isExpert: true,
        text: "A Constituição permite o gradualismo. Tecnicamente, implementar autarquias em municípios sem capacidade de arrecadação de receitas próprias seria criar 'municípios mendigos'. O Executivo está primeiro a capacitar os quadros locais e a criar infraestruturas administrativas para que o poder local seja efectivo e não apenas simbólico.",
        likes: 215,
        side: "favor",
        time: "1h",
      },
    ],
  },
  {
    id: "d3",
    category: "Emprego",
    title: "PAPE: O impacto dos Kits Profissionais no auto-emprego",
    summary:
      "O Plano de Acção para a Promoção da Empregabilidade já beneficiou milhares de jovens. Analisamos a eficácia desta estratégia de fomento.",
    participants: 1200,
    experts: 12,
    date: "2 dias",
    hot: true,
    comments: [
      {
        id: "c301",
        author: "Sandra Bento",
        role: "Desempregada",
        isExpert: false,
        text: "Dizem que dão kits, mas eu ainda não vi como me candidatar. Isso chega mesmo a quem não tem conhecimentos?",
        likes: 54,
        side: "neutro",
        time: "5h",
      },
      {
        id: "c302",
        author: "Dr. Mateus Rocha",
        role: "Especialista em Políticas Públicas de Emprego",
        isExpert: true,
        text: "O PAPE opera através dos Centros de Emprego e IFEBP. Diferente do emprego público limitado, o kit profissional oferece os meios de produção (ferramentas e microcrédito) para que o jovem se torne patrão. Os dados mostram que 85% dos beneficiários conseguem sustentar as suas famílias e até contratar outros ajudantes em menos de 6 meses.",
        likes: 290,
        side: "favor",
        time: "3h",
      },
    ],
  },
  {
    id: "d4",
    category: "Energia",
    title: "Transição Energética: Os Parques Solares do Biópio e Baía Farta",
    summary:
      "Angola está a liderar a transição energética na África Subsariana com investimentos massivos em energia limpa.",
    participants: 432,
    experts: 4,
    date: "3 dias",
    hot: false,
    comments: [
      {
        id: "c401",
        author: "Eng. Pedro Simão",
        role: "Especialista em Energias Renováveis",
        isExpert: true,
        text: "Com a redução da queima de combustíveis fósseis nas centrais térmicas, o Estado poupa milhões em logística e manutenção. Estes parques solares não são apenas ecológicos, são a base para uma tarifa de energia mais estável e barata para a indústria nacional.",
        likes: 180,
        side: "favor",
        time: "1d",
      },
    ],
  },
  {
    id: "d5",
    category: "Justiça",
    title: "Recuperação de Activos: Transparência e Retorno Social",
    summary:
      "O combate à corrupção permitiu a recuperação de biliões de dólares em bens e dinheiro. Como estão a ser usados estes fundos?",
    participants: 750,
    experts: 6,
    date: "4 dias",
    hot: true,
    comments: [
      {
        id: "c501",
        author: "Carla Viegas",
        role: "Contabilista",
        isExpert: false,
        text: "Ouvimos falar de hotéis e fábricas recuperadas, mas isso ajuda o povo em quê?",
        likes: 67,
        side: "neutro",
        time: "6h",
      },
      {
        id: "c502",
        author: "Dr. Felisberto N'gola",
        role: "Magistrado / Especialista em Direito Patrimonial",
        isExpert: true,
        text: "A recuperação de activos é pedagógica. Os activos financeiros recuperados pelo Serviço Nacional de Recuperação de Activos (PGR) estão a ser canalizados directamente para o PIIM (Plano Integrado de Intervenção nos Municípios). Ou seja, o dinheiro que foi desviado está agora a construir as escolas e centros de saúde que o cidadão vê no seu bairro.",
        likes: 412,
        side: "favor",
        time: "2h",
      },
    ],
  },
  {
    id: "d6",
    category: "Agricultura",
    title: "PRODESI e a Substituição de Importações: O caso do Arroz e Milho",
    summary:
      "A produção nacional está a crescer. Angola caminha para a auto-suficiência em cereais essenciais.",
    participants: 310,
    experts: 3,
    date: "5 dias",
    hot: false,
    comments: [
      {
        id: "c601",
        author: "Joaquim Cassule",
        role: "Comerciante",
        isExpert: false,
        text: "O produto nacional às vezes chega mais caro ao mercado do que o importado. Porquê?",
        likes: 42,
        side: "neutro",
        time: "1d",
      },
      {
        id: "c602",
        author: "Eng.ª Fátima Silva",
        role: "Agrónoma · Consultora de Agronegócio",
        isExpert: true,
        text: "O custo unitário é alto inicialmente devido aos investimentos estruturais (preparação de solos e maquinaria). Contudo, o PRODESI está a financiar o crédito de campanha para baixar os custos de produção. À medida que a escala aumenta, como estamos a ver no leste do país, o preço final ao consumidor cairá drasticamente, garantindo soberania alimentar.",
        likes: 156,
        side: "favor",
        time: "12h",
      },
    ],
  },
];
