import { z } from "zod";

export const keyTermSchema = z.object({
  term: z.string().trim().min(1, "O termo é obrigatório"),
  definition: z.string().trim().min(1, "A definição é obrigatória"),
});

export const articleReferenceSchema = z.object({
  label: z.string().trim().min(1, "O título da referência é obrigatório"),
  url: z.union([z.string().trim().url("URL inválido"), z.literal("")]),
});

const articleContentSchema = z.object({
  basico: z.string().trim().min(1, "O conteúdo do nível Básico é obrigatório"),
  intermedio: z.string(),
  avancado: z.string(),
});

export const articleSubmitSchema = z.object({
  title: z.string().trim().min(3, "O título deve ter pelo menos 3 caracteres"),
  category: z.string().min(1, "Escolhe uma categoria"),
  excerpt: z.string().max(200, "O resumo não pode exceder 200 caracteres"),
  date: z.string().min(1, "A data é obrigatória"),
  content: articleContentSchema,
  terms: z.array(keyTermSchema).max(8, "Máximo de 8 termos"),
  refs: z.array(articleReferenceSchema),
});

export const articleDraftSchema = articleSubmitSchema.extend({
  title: z.string().trim().min(1, "O título é obrigatório para guardar o rascunho"),
  content: articleContentSchema.extend({ basico: z.string() }),
});

export type ArticleSubmitInput = z.infer<typeof articleSubmitSchema>;
export type ArticleDraftInput = z.infer<typeof articleDraftSchema>;

export const debateSchema = z.object({
  title: z.string().trim().min(3, "O título deve ter pelo menos 3 caracteres"),
  category: z.string().min(1, "Escolhe uma categoria"),
  summary: z.string().trim().min(10, "O resumo deve ter pelo menos 10 caracteres").max(300),
  stance: z.enum(["favor", "neutro", "contra"]),
  argument: z.string().trim().min(10, "O argumento inicial deve ter pelo menos 10 caracteres"),
  tags: z.array(z.string().trim().min(1)).max(3, "Máximo de 3 especialistas convidados"),
});

export type DebateInput = z.infer<typeof debateSchema>;
