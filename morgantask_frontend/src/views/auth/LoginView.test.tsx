import { useMutation } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { beforeEach, describe, expect, test, vi } from "vitest";
import LoginView from "./LoginView";

const navigate = vi.fn();

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useMutation: vi.fn()
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate
  };
});

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

describe("LoginView", () => {
  const mutate = vi.fn();
  let mutationOptions: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    mutationOptions = [];
    vi.mocked(useMutation).mockImplementation((options: any) => {
      mutationOptions.push(options);
      return { mutate } as any;
    });
  });

  test("debe renderizar el formulario de inicio de sesión", () => {
    render(
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email de Registro")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña de Registro")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Iniciar Sesión")).toBeInTheDocument();
    expect(screen.getByText("¿No tienes cuenta? Crear Una")).toBeInTheDocument();
  });

  test("debe enviar las credenciales al iniciar sesión", async () => {
    render(
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email de Registro"), { target: { value: "john@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Contraseña de Registro"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByDisplayValue("Iniciar Sesión"));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        email: "john@test.com",
        password: "secret123"
      });
    });
  });

  test("debe navegar al home cuando el login es exitoso", () => {
    render(
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    );

    mutationOptions[0].onSuccess();

    expect(navigate).toHaveBeenCalledWith("/");
  });

  test("debe mostrar toast cuando el login falla", () => {
    render(
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    );

    mutationOptions[0].onError(new Error("Credenciales inválidas"));

    expect(toast.error).toHaveBeenCalledWith("Credenciales inválidas");
  });
});
