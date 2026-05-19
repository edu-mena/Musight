export type AdminRole = "user" | "researcher" | "expert" | "admin";
export type AdminContentStatus = "em_revisao" | "publicado" | "recusado";

export const roleLabels: Record<string, string> = {
  user: "Utilizador",
  researcher: "Pesquisador",
  expert: "Especialista",
  admin: "Administrador",
};

export const rolePillCls: Record<string, string> = {
  user: "bg-muted text-foreground",
  researcher: "bg-violet-100 text-violet-700",
  expert: "bg-sky-100 text-sky-700",
  admin: "bg-slate-200 text-slate-800",
};
