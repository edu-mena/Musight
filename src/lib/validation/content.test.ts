import { describe, expect, it } from "vitest";
import { articleSubmitSchema, debateSchema } from "./content";

const validArticle = {
  title: "Um título válido",
  category: "Economia",
  excerpt: "",
  date: "2026-07-03",
  content: { basico: "Conteúdo básico", intermedio: "", avancado: "" },
  terms: [],
  refs: [],
};

describe("articleSubmitSchema", () => {
  it("accepts a valid article", () => {
    expect(articleSubmitSchema.safeParse(validArticle).success).toBe(true);
  });

  it("rejects an article without basic-level content", () => {
    const result = articleSubmitSchema.safeParse({
      ...validArticle,
      content: { ...validArticle.content, basico: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a reference with an invalid URL", () => {
    const result = articleSubmitSchema.safeParse({
      ...validArticle,
      refs: [{ label: "Fonte", url: "not-a-url" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a reference with an empty URL", () => {
    const result = articleSubmitSchema.safeParse({
      ...validArticle,
      refs: [{ label: "Fonte", url: "" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("debateSchema", () => {
  const validDebate = {
    title: "Devemos investir mais em educação?",
    category: "Educação",
    summary: "Um resumo com mais de dez caracteres.",
    stance: "favor" as const,
    argument: "Um argumento com mais de dez caracteres.",
    tags: [],
  };

  it("accepts a valid debate", () => {
    expect(debateSchema.safeParse(validDebate).success).toBe(true);
  });

  it("rejects more than 3 tags", () => {
    const result = debateSchema.safeParse({ ...validDebate, tags: ["a", "b", "c", "d"] });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid stance", () => {
    const result = debateSchema.safeParse({ ...validDebate, stance: "invalido" });
    expect(result.success).toBe(false);
  });
});
