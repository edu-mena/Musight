import { z } from "zod";

// Integre o valor padrão diretamente no Schema do Zod
const envSchema = z.object({
  VITE_API_URL: z.string().url().default("https://rosybrown-wasp-975017.hostingersite.com"),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_GROQ_API_KEY: z.string().optional(),
});

function parseEnv() {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `   - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Variáveis de ambiente inválidas ou em falta:\n${issues}`);
  }
  return result.data;
}

export const env = parseEnv();
