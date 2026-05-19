export type ContentStatus = "publicado" | "rascunho" | "em_revisao" | "recusado";

export const CATEGORIES = [
  "Economia", "Política", "Saúde", "Educação", "Direito",
  "Infraestruturas", "Diplomacia", "Soberania Alimentar",
  "Protecção Social", "Média & Comunicação", "Ciência & Tecnologia",
];

export const statusMeta: Record<ContentStatus, { label: string; cls: string }> = {
  publicado: { label: "Publicado", cls: "bg-emerald-100 text-emerald-700" },
  rascunho: { label: "Rascunho", cls: "bg-amber-100 text-amber-700" },
  em_revisao: { label: "Em revisão", cls: "bg-sky-100 text-sky-700" },
  recusado: { label: "Recusado", cls: "bg-red-100 text-red-700" },
};

export const levelMeta: Record<"basico" | "intermedio" | "avancado", { label: string; cls: string }> = {
  basico: { label: "Básico", cls: "bg-emerald-100 text-emerald-700" },
  intermedio: { label: "Intermédio", cls: "bg-amber-100 text-amber-700" },
  avancado: { label: "Avançado", cls: "bg-sky-100 text-sky-700" },
};
