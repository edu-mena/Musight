import { z } from "zod";

const optionalUrl = z.union([z.string().trim().url("URL inválido"), z.literal("")]);

export const expertiseItemSchema = z.object({
  topic: z.string().trim().min(1, "O tópico é obrigatório"),
  level: z.enum(["basico", "intermedio", "avancado"]),
});

export const researcherProfileSchema = z.object({
  bio: z.string().max(500, "A bio não pode exceder 500 caracteres"),
  academicLevel: z.string(),
  academicArea: z.string(),
  institution: z.string(),
  profession: z.string(),
  organization: z.string(),
  website: optionalUrl,
  linkedin: optionalUrl,
  expertise: z.array(expertiseItemSchema),
});

export type ResearcherProfileInput = z.infer<typeof researcherProfileSchema>;

export const profileNameSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres"),
});

export const readerProfileInfoSchema = z.object({
  academicLevel: z.string(),
  academicArea: z.string(),
  institution: z.string(),
  profession: z.string(),
  organization: z.string(),
  bio: z.string().max(220, "A bio não pode exceder 220 caracteres"),
});

export type ReaderProfileInfoInput = z.infer<typeof readerProfileInfoSchema>;

export const writerApplicationSchema = z.object({
  focusArea: z.string().min(1, "Escolhe uma área de foco"),
  motivation: z
    .string()
    .trim()
    .min(20, "A motivação deve ter pelo menos 20 caracteres")
    .max(280, "A motivação não pode exceder 280 caracteres"),
  portfolioUrl: optionalUrl,
  agreed: z.boolean().refine((v) => v === true, "Tens de aceitar o compromisso editorial"),
});

export type WriterApplicationInput = z.infer<typeof writerApplicationSchema>;
