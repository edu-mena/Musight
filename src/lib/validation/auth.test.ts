import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@example.com",
      password: "123456",
      termsAccepted: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@example.com",
      password: "123",
      termsAccepted: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects when terms are not accepted", () => {
    const result = registerSchema.safeParse({
      name: "Ana",
      email: "ana@example.com",
      password: "123456",
      termsAccepted: false,
    });
    expect(result.success).toBe(false);
  });
});
