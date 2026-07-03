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

export interface Reference {
  label: string;
  url?: string;
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
  audioSrc?: string;
  references?: Reference[];
}

export const articles: Article[] = [
  {
    id: "a1",
    category: "Economia",
    title: "Estabilidade Monetária: O BNA e a Protecção do Poder de Compra",
    date: "06 MAI 2026",
    image: null,
    audioAvailable: true,
    audioDuration: "8 min",
    audioSrc: "/artigos/audios/Estabilidade Monetária O BNA e a Protecção do Poder de Compra.mp3",
    references: [
      {
        label: "BNA — Comunicado do Comité de Política Monetária, Maio 2026",
        url: "https://www.bna.ao",
      },
      {
        label: "INE Angola — Índice de Preços no Consumidor, Abril 2026",
        url: "https://www.ine.gov.ao",
      },
    ],
    keyTerms: [
      {
        term: "Taxa BNA",
        definition:
          "Principal instrumento de política monetária. Ao ajustá-la, o Banco Central sinaliza ao mercado o custo do dinheiro, visando controlar a liquidez e a inflação.",
      },
      {
        term: "Estabilidade de Preços",
        definition:
          "Objectivo primordial do Executivo para garantir que o salário das famílias angolanas mantenha o seu valor real ao longo do tempo.",
      },
      {
        term: "Comité de Política Monetária (CPM)",
        definition:
          "Órgão técnico do BNA que analisa indicadores globais e nacionais para tomar decisões que assegurem o equilíbrio macroeconómico.",
      },
    ],
    levels: [
      {
        id: "basico",
        label: "Básico",
        sublabel: "Para o Cidadão",
        text: "O Banco Nacional de Angola (BNA) decidiu subir ligeiramente os juros para 19,5%. Pode parecer um detalhe técnico, mas na verdade é o Governo a agir para evitar que os preços nos mercados subam sem controlo. É uma medida de protecção para que o seu dinheiro continue a ter valor amanhã.",
      },
      {
        id: "intermedio",
        label: "Intermédio",
        sublabel: "Visão Prática",
        text: "A subida da taxa de juro de referência para 19,5% é uma resposta proactiva do Executivo à conjuntura económica actual. Ao tornar o crédito mais criterioso, o BNA reduz a pressão sobre a procura interna, o que é essencial para baixar a inflação (actualmente em 23,4%) e estabilizar o Kwanza face às divisas estrangeiras.",
      },
      {
        id: "avancado",
        label: "Avançado",
        sublabel: "Análise Técnica",
        text: "O aperto monetário de 50 pontos base demonstra o compromisso do CPM com o regime de metas de inflação. Esta medida visa mitigar o 'pass-through' cambial e ancorar as expectativas dos agentes económicos. A estratégia foca-se na absorção da liquidez excedentária no sistema bancário, garantindo que a base monetária evolua em linha com o crescimento sustentável do PIB não-petrolífero.",
      },
    ],
  },
  {
    id: "a2",
    category: "Diplomacia",
    title: "Angola no Mundo: Expansão Consular Reforça Apoio à Diáspora",
    date: "03 MAI 2026",
    image: null,
    audioAvailable: true,
    audioDuration: "6 min",
    references: [
      { label: "MIREX — Nota à Imprensa: Inauguração do Consulado Geral em Ottawa, Março 2026" },
      {
        label: "Convenção de Viena sobre Relações Consulares (1963)",
        url: "https://www.un.org/en/genocideprevention/documents/atrocity-crimes/Doc.23_Vienna%20Convention%20on%20Consular%20Relations.pdf",
      },
    ],
    keyTerms: [
      {
        term: "Diplomacia Económica",
        definition:
          "Estratégia do Executivo que utiliza as relações externas para atrair investimento estrangeiro e criar mercados para produtos angolanos.",
      },
      {
        term: "Protecção Consular",
        definition:
          "Dever do Estado em prestar assistência jurídica, administrativa e social aos angolanos que residem ou viajam pelo estrangeiro.",
      },
    ],
    levels: [
      {
        id: "basico",
        label: "Básico",
        sublabel: "Para o Cidadão",
        text: "O Governo abriu um novo Consulado Geral no Canadá. Isto significa que os angolanos que vivem lá já não precisam de viajar longas distâncias para renovar o passaporte ou tratar de documentos. É a administração pública a chegar mais perto de todos os filhos da pátria, onde quer que estejam.",
      },
      {
        id: "intermedio",
        label: "Intermédio",
        sublabel: "Contexto Político",
        text: "A inauguração deste consulado em Ottawa faz parte da nova política de proximidade do Executivo com a Diáspora. Além de facilitar a vida dos cidadãos, este novo posto serve como uma antena para atrair investidores canadianos nos sectores da mineração e agricultura, áreas onde o Canadá é líder mundial.",
      },
      {
        id: "avancado",
        label: "Avançado",
        sublabel: "Estratégia Geopolítica",
        text: "A expansão da rede consular na América do Norte reflecte a maturidade da diplomacia angolana. Sob a égide da Convenção de Viena, esta missão foca-se na simplificação de processos consulares digitalizados e na promoção da imagem de Angola como destino seguro para o capital estrangeiro, alinhando-se com as reformas de desburocratização do Estado.",
      },
    ],
  },
  {
    id: "a3",
    category: "Saúde Pública",
    title: "Vigilância Epidemiológica: A Resposta Eficiente do Ministério da Saúde",
    date: "01 MAI 2026",
    image: null,
    audioAvailable: false,
    keyTerms: [
      {
        term: "Segurança Sanitária",
        definition:
          "Capacidade do Estado em detectar e responder rapidamente a ameaças de saúde pública para proteger a população.",
      },
      {
        term: "Saneamento Básico (PIIM)",
        definition:
          "Investimentos em infraestruturas de água e esgotos que o Executivo está a realizar em todo o país para erradicar doenças transmissíveis.",
      },
    ],
    levels: [
      {
        id: "basico",
        label: "Básico",
        sublabel: "Prevenção",
        text: "O Ministério da Saúde está a actuar com rapidez em Luanda para travar novos casos de cólera. O Governo já reforçou o fornecimento de água potável e equipou os centros de saúde. A sua parte é importante: ferva a água e lave sempre as mãos. Juntos, vamos ultrapassar este desafio.",
      },
      {
        id: "intermedio",
        label: "Intermédio",
        sublabel: "Acção Governamental",
        text: "Graças ao investimento do Executivo em sistemas de alerta precoce, os casos de cólera em Viana e Cacuaco foram detectados imediatamente. Estão em curso brigadas de fumigação e distribuição de 'Certeza'. Esta prontidão demonstra que o Sistema Nacional de Saúde está hoje muito mais robusto e preparado para crises.",
      },
      {
        id: "avancado",
        label: "Avançado",
        sublabel: "Gestão de Crises",
        text: "A contenção do surto baseia-se num protocolo de vigilância epidemiológica activa e no mapeamento de hotspots. A letalidade mantém-se em níveis mínimos (0,5%) devido à pré-posição de stocks de soros e antibióticos. Esta eficiência é resultado da reforma do sector da saúde, que prioriza a medicina preventiva e a resposta rápida em contextos urbanos densos.",
      },
    ],
  },
  {
    id: "a4",
    category: "Infraestruturas",
    title: "Aeroporto Dr. Agostinho Neto: O Novo Motor do Turismo e Comércio",
    date: "28 ABR 2026",
    image: null,
    audioAvailable: true,
    audioDuration: "10 min",
    references: [
      { label: "ANACIP — Relatório de Operacionalização AIAAN, 1.º Trimestre 2026" },
      { label: "Ministério dos Transportes — Plano Estratégico do Sector Aéreo 2025–2030" },
      {
        label: "TAAG Angola Airlines — Comunicado de Imprensa, Abril 2026",
        url: "https://www.taag.com",
      },
    ],
    keyTerms: [
      {
        term: "Hub Logístico",
        definition:
          "Ponto central de transporte que liga diferentes partes do mundo, gerando receitas através de taxas aeroportuárias e serviços de carga.",
      },
      {
        term: "ZEE",
        definition:
          "Zona Económica Especial - áreas com benefícios fiscais próximas a grandes infraestruturas para atrair fábricas e empresas.",
      },
    ],
    levels: [
      {
        id: "basico",
        label: "Básico",
        sublabel: "Progresso",
        text: "O novo aeroporto já está a mudar a face de Angola. Ele traz mais turistas, mais negócios e cria milhares de empregos para os nossos jovens. É uma obra que orgulha qualquer angolano e mostra a grandeza do nosso país.",
      },
      {
        id: "intermedio",
        label: "Intermédio",
        sublabel: "Impacto Económico",
        text: "Com capacidade para 15 milhões de passageiros, o AIAAN (Aeroporto Internacional Dr. Agostinho Neto) não é apenas uma pista de aviões, é uma plataforma de desenvolvimento. O Executivo está a ligar o aeroporto ao comboio e a novas estradas, facilitando o comércio de produtos agrícolas do interior para o mundo.",
      },
      {
        id: "avancado",
        label: "Avançado",
        sublabel: "Geopolítica de Transportes",
        text: "A operacionalização total do AIAAN posiciona Angola como o principal player logístico da região SADC. A infraestrutura foi desenhada para captar o tráfego transcontinental, competindo com hubs de Joanesburgo e Adis Abeba. Este activo estratégico maximiza a rentabilidade da TAAG e potencia a criação de um ecossistema de serviços de manutenção e logística de alto valor acrescentado.",
      },
    ],
  },
  {
    id: "a5",
    category: "Soberania Alimentar",
    title: "PLANAGRÃO: A Revolução Silenciosa no Planalto Central",
    date: "10 MAI 2026",
    image: null,
    audioAvailable: true,
    audioDuration: "12 min",
    references: [
      {
        label:
          "Ministério da Agricultura e Florestas — Plano Nacional de Desenvolvimento de Grãos 2025–2030",
        url: "https://www.minagri.gov.ao",
      },
      { label: "Banco Mundial — Angola Agricultural Sector Review, 2025" },
      {
        label: "FAO — Perspectivas de Colheitas e Situação Alimentar: Angola, Março 2026",
        url: "https://www.fao.org",
      },
    ],
    keyTerms: [
      {
        term: "Autossuficiência",
        definition:
          "Capacidade de um país produzir internamente tudo o que consome, eliminando a dependência de importações estrangeiras.",
      },
      {
        term: "Cadeia de Valor",
        definition:
          "O percurso total de um produto, desde a preparação do solo, colheita, processamento industrial até chegar à mesa do consumidor.",
      },
      {
        term: "Crédito Agrícola Bonificado",
        definition:
          "Empréstimos com taxas de juro muito baixas, suportadas pelo Estado, para incentivar os produtores a investir em máquinas e sementes.",
      },
    ],
    levels: [
      {
        id: "basico",
        label: "Básico",
        sublabel: "Para o Cidadão",
        text: "O PLANAGRÃO é o grande plano do Governo para que Angola pare de comprar comida fora e passe a produzir tudo aqui dentro. Imagine o nosso país a produzir milhões de toneladas de milho, arroz e soja. Isso significa pão mais barato, fuba feita na nossa terra e muitos novos empregos para os jovens no campo. É o Executivo a garantir que a comida nunca falte na mesa das famílias angolanas.",
      },
      {
        id: "intermedio",
        label: "Intermédio",
        sublabel: "Visão Prática",
        text: "Com um investimento previsto de cerca de 5,7 mil milhões de dólares nos próximos cinco anos, o PLANAGRÃO não é apenas um projecto agrícola, é uma estratégia de segurança nacional. O Executivo está a lotear vastas áreas de cultivo, principalmente nas províncias do Cuando Cubango, Moxico, Lunda Sul e Lunda Norte, garantindo infraestruturas como estradas e energia. Ao reduzir a factura das importações, o Governo liberta divisas (dólares) para outros sectores essenciais, como a tecnologia e a saúde.",
      },
      {
        id: "avancado",
        label: "Avançado",
        sublabel: "Análise Técnica",
        text: "A operacionalização do PLANAGRÃO foca-se na correcção do défice estrutural de cereais e oleaginosas. O modelo baseia-se na criação de pólos agro-industriais integrados, onde a produtividade é maximizada por via da mecanização e do uso de fertilizantes adaptados aos solos do planalto. Do ponto de vista macroeconómico, o objectivo é alterar a composição do PIB, aumentando o peso do sector não-petrolífero para 75% até 2030, reduzindo assim a vulnerabilidade do Kwanza aos choques externos do preço do Brent. É uma reforma que ataca a causa raiz da inflação alimentar em Angola.",
      },
    ],
  },
  {
    id: "a6",
    category: "Protecção Social",
    title: "KWENDA: O Maior Programa de Transferências Sociais da África Austral",
    date: "08 MAI 2026",
    image: null,
    audioAvailable: true,
    audioDuration: "9 min",
    keyTerms: [
      {
        term: "Transferência Monetária",
        definition:
          "Entrega directa de dinheiro às famílias mais pobres, permitindo que elas decidam como suprir as suas necessidades básicas.",
      },
      {
        term: "Inclusão Financeira",
        definition:
          "Processo de dar acesso a contas bancárias e serviços financeiros a pessoas que nunca tiveram contacto com bancos.",
      },
    ],
    levels: [
      {
        id: "basico",
        label: "Básico",
        sublabel: "Solidariedade",
        text: "O Governo sabe que a vida não está fácil para todos, por isso criou o KWENDA. É um programa que dá dinheiro directamente às mãos das mães e pais de família nas zonas mais distantes. Mas não é só dar dinheiro: é ensinar a gerir, é ajudar a criar pequenos negócios e garantir que as crianças tenham registo civil e escola. É o MPLA a cuidar dos angolanos que mais precisam, com dignidade e respeito.",
      },
      {
        id: "intermedio",
        label: "Intermédio",
        sublabel: "Contexto Social",
        text: "O Programa de Fortalecimento da Protecção Social (KWENDA) já beneficiou mais de 1 milhão de agregados familiares em todo o território nacional. Diferente de subsídios antigos que eram ineficientes, o KWENDA utiliza um Cadastro Único Social rigoroso para garantir que o apoio chega a quem realmente vive em situação de pobreza extrema. O Executivo utiliza este programa como porta de entrada para outros serviços públicos, como a vacinação e o empreendedorismo local.",
      },
      {
        id: "avancado",
        label: "Avançado",
        sublabel: "Eficácia de Políticas",
        text: "O KWENDA representa uma mudança de paradigma na política fiscal angolana: a transição de subsídios indirectos ao consumo (como os combustíveis) para subsídios directos ao rendimento. Estudos de impacto indicam que cada Kwanza investido no KWENDA gera um multiplicador económico local, activando mercados rurais e reduzindo o coeficiente de Gini (desigualdade). A robustez do programa tem sido elogiada por instituições internacionais como o Banco Mundial, posicionando o Executivo como uma referência em gestão de redes de protecção social em países em desenvolvimento.",
      },
    ],
  },
  {
    id: "a7",
    category: "Infraestruturas",
    title: "Corredor do Lobito: A Nova Rota da Prosperidade Regional",
    date: "05 MAI 2026",
    image: null,
    audioAvailable: false,
    references: [
      { label: "Governo de Angola — Acordo de Concessão Corredor do Lobito, 2024" },
      {
        label: "SADC — Regional Infrastructure Development Master Plan, 2025",
        url: "https://www.sadc.int",
      },
      { label: "Porto do Lobito — Relatório Anual de Operações 2025" },
    ],
    keyTerms: [
      {
        term: "Intermodalidade",
        definition:
          "A combinação de diferentes meios de transporte (comboio, navio, camião) para mover mercadorias de forma rápida e barata.",
      },
      {
        term: "Parceria Público-Privada (PPP)",
        definition:
          "Contrato onde o Governo e empresas privadas trabalham juntos para gerir grandes infraestruturas, dividindo custos e lucros.",
      },
    ],
    levels: [
      {
        id: "basico",
        label: "Básico",
        sublabel: "Desenvolvimento",
        text: "O Porto do Lobito e o Caminho de Ferro de Benguela estão agora ligados para transportar minérios e produtos de vários países vizinhos até ao mar. O que é que nós ganhamos com isso? Milhares de empregos para os nossos jovens, cidades mais modernas ao longo da linha do comboio e muito dinheiro que entra para o nosso Estado através de taxas. Angola está a tornar-se o centro de África.",
      },
      {
        id: "intermedio",
        label: "Intermédio",
        sublabel: "Economia Regional",
        text: "A revitalização do Corredor do Lobito é a peça fundamental da estratégia logística do Executivo. Ao atrair consórcios internacionais para gerir a linha, o Governo garante manutenção de alta qualidade sem gastar dinheiro do Orçamento Geral do Estado. Este corredor permite que países como a Zâmbia e a RDC exportem o seu cobre através de Angola, transformando o nosso país numa potência de serviços logísticos.",
      },
      {
        id: "avancado",
        label: "Avançado",
        sublabel: "Geopolítica Estratégica",
        text: "A concessão do Corredor do Lobito à 'Lobito Atlantic Railway' é um marco na diplomacia económica de Angola. Ao criar um hub logístico que liga o Atlântico ao interior do continente, o Executivo aumenta o 'leverage' (poder de influência) geopolítico do país no seio da SADC. A integração intermodal reduz o 'lead time' de transporte em 50% face aos portos do Índico, captando fluxos comerciais globais e fomentando a instalação de zonas de processamento de exportações (ZPE) em solo angolano.",
      },
    ],
  },
];
