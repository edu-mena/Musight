import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Login } from "./Login";

const login = vi.fn();

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ login }),
}));

describe("Login", () => {
  it("shows validation errors and does not call login when the form is empty", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("O email é obrigatório")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("calls login with the entered credentials on valid submit", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText("o.teu@email.com"), "ana@example.com");
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("ana@example.com", "secret123");
    });
  });
});
