export interface KeyTerm {
  term: string;
  definition: string;
}

export interface ExplainLevel {
  id: "basico" | "intermedio" | "avancado";
  label: string;
  sublabel: string;
  text: string;
}

export interface Article {
  id: string;
  category: string;
  title: string;
  date: string;
  image: string | null;
  levels: ExplainLevel[];
  keyTerms: KeyTerm[];
  audioAvailable: boolean;
  audioDuration?: string;
}

export const articles: Article[] = [
  {
    id: "a1",
    category: "Economia",
    title: "O Banco Nacional de Angola sobe a taxa BNA para 19,5%",
    date: "06 MAI 2026",
    image: null,
    audioAvailable: true,
    audioDuration: "8 min",
    keyTerms: [
      { term: "Taxa BNA", definition: "Taxa de juro de referência definida pelo Banco Nacional de Angola. Quando sobe, os créditos ficam mais caros e o consumo abranda — o que ajuda a reduzir a inflação." },
      { term: "Inflação", definition: "Aumento geral e contínuo dos preços numa economia. Quando a inflação sobe, o mesmo dinheiro compra menos coisas do que antes." },
      { term: "BNA", definition: "Banco Nacional de Angola — banco central do país, responsável pela política monetária, emissão de moeda e estabilidade do sistema financeiro." },
      { term: "Política monetária", definition: "Conjunto de medidas tomadas pelo banco central para controlar a quantidade de dinheiro em circulação e as taxas de juro, com o objectivo de manter a estabilidade económica." },
    ],
    levels: [
      {
        id: "basico",
        label: "Básico",
        sublabel: "Para todos",
        text: "O Banco Nacional de Angola decidiu subir os juros. Isso significa que vai ficar mais caro pedir dinheiro emprestado ao banco. O objectivo é tentar que os preços das coisas parem de subir tão rápido — a chamada inflação, que está em 23,4%.",
      },
      {
        id: "intermedio",
        label: "Intermédio",
        sublabel: "Com contexto",
        text: "O BNA elevou a taxa de juro de referência (taxa BNA) de 19% para 19,5%, numa tentativa de conter a inflação que persiste acima dos 23%. Esta medida de política monetária encarece o crédito bancário, reduzindo o consumo e o investimento, o que tende a arrefecer a pressão sobre os preços.",
      },
      {
        id: "avancado",
        label: "Avançado",
        sublabel: "Técnico",
        text: "A subida de 50 pontos base da taxa BNA reflecte a postura hawkish do Comité de Política Monetária face à persistência inflacionária, agravada pelo pass-through cambial estimado em 1,2–1,8 p.p. sobre o IPC. O aperto monetário visa ancorar expectativas, embora comprometa a trajectória de crescimento do crédito ao sector privado, actualmente em contracção real.",
      },
    ],
  },
  {
    id: "a2",
    category: "Política",
    title: "Angola inaugura Consulado Geral no Canadá em gesto diplomático",
    date: "03 MAI 2026",
    image: null,
    audioAvailable: true,
    audioDuration: "6 min",
    keyTerms: [
      { term: "Consulado", definition: "Representação oficial de um país noutro, com funções de apoio aos cidadãos no estrangeiro (vistos, documentos, assistência). Diferente da embaixada, que trata de relações políticas." },
      { term: "Diáspora", definition: "Conjunto de cidadãos de um país que vivem fora do seu país de origem, mantendo laços culturais e identitários com a sua nação." },
    ],
    levels: [
      {
        id: "basico",
        label: "Básico",
        sublabel: "Para todos",
        text: "Angola abriu um consulado no Canadá. Um consulado é como um escritório do governo angolano noutro país, que ajuda os angolanos que vivem lá com documentos, passaportes e outros serviços.",
      },
      {
        id: "intermedio",
        label: "Intermédio",
        sublabel: "Com contexto",
        text: "A abertura do Consulado Geral em Ottawa reforça a presença diplomática angolana numa região com crescente comunidade da diáspora. A medida facilita serviços consulares e pode impulsionar relações comerciais e de investimento entre os dois países.",
      },
      {
        id: "avancado",
        label: "Avançado",
        sublabel: "Técnico",
        text: "A inauguração do Consulado Geral em Ottawa insere-se na estratégia de diversificação das parcerias diplomáticas de Luanda, reduzindo a dependência dos eixos tradicionais. Do ponto de vista do direito internacional, a missão consular opera sob a Convenção de Viena de 1963, com imunidade funcional mas não pessoal, ao contrário das missões diplomáticas.",
      },
    ],
  },
  {
    id: "a3",
    category: "Saúde",
    title: "Novo surto de cólera em Luanda: o que precisa de saber",
    date: "01 MAI 2026",
    image: null,
    audioAvailable: false,
    keyTerms: [
      { term: "Cólera", definition: "Doença infecciosa causada pela bactéria Vibrio cholerae, transmitida principalmente por água ou alimentos contaminados. Provoca diarreia severa e desidratação rápida." },
      { term: "Surto", definition: "Ocorrência de casos de uma doença em número superior ao esperado numa determinada área e período de tempo." },
      { term: "SRO", definition: "Sais de Reidratação Oral — solução de açúcar e sal em água que repõe os líquidos e minerais perdidos. É o tratamento principal para casos ligeiros de cólera." },
    ],
    levels: [
      {
        id: "basico",
        label: "Básico",
        sublabel: "Para todos",
        text: "Há um novo surto de cólera em Luanda. A cólera é uma doença que se apanha pela água ou comida contaminada e causa diarreia muito forte. Para se proteger: beba água fervida ou tratada, lave as mãos com sabão e cozinhe bem os alimentos.",
      },
      {
        id: "intermedio",
        label: "Intermédio",
        sublabel: "Com contexto",
        text: "O Ministério da Saúde confirmou 43 novos casos de cólera nos municípios de Viana e Cacuaco. A doença propaga-se por contaminação fecal-oral, sendo as infraestruturas de saneamento deficientes o principal factor de risco. O tratamento com SRO é eficaz em 80% dos casos ligeiros.",
      },
      {
        id: "avancado",
        label: "Avançado",
        sublabel: "Técnico",
        text: "O biotipo El Tor da estirpe O1 continua a ser o agente etiológico predominante nos surtos em Angola. A letalidade actual situa-se abaixo de 1%, indicando acesso razoável a reidratação. A vigilância epidemiológica deve priorizar o mapeamento das fontes de água e o rastreio de contactos para contenção do coeficiente de transmissão (R₀ estimado em 1.2–2.5 em contexto urbano denso).",
      },
    ],
  },
];
