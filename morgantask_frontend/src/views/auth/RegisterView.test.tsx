import { useMutation } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { beforeEach, describe, expect, test, vi } from "vitest";
import RegisterView from "./RegisterView";

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual<typeof import("@tanstack/react-query")>("@tanstack/react-query");
  return {
    ...actual,
    useMutation: vi.fn()
  };
});

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

describe("RegisterView", () => {
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

  test("debe renderizar el formulario de registro", () => {
    render(
      <MemoryRouter>
        <RegisterView />
      </MemoryRouter>
    );

    expect(screen.getByText("Crear Cuenta")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email de Registro")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre de Registro")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Registrarme")).toBeInTheDocument();
  });

  test("debe enviar el formulario de registro", async () => {
    render(
      <MemoryRouter>
        <RegisterView />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email de Registro"), { target: { value: "john@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Nombre de Registro"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Contraseña de Registro"), { target: { value: "secret123" } });
    fireEvent.change(screen.getByPlaceholderText("Repite Contraseña de Registro"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByDisplayValue("Registrarme"));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        email: "john@test.com",
        name: "John Doe",
        password: "secret123",
        password_confirmation: "secret123"
      });
    });
  });

  test("debe limpiar el formulario cuando el registro es exitoso", async () => {
    render(
      <MemoryRouter>
        <RegisterView />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email de Registro"), { target: { value: "john@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Nombre de Registro"), { target: { value: "John Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Contraseña de Registro"), { target: { value: "secret123" } });
    fireEvent.change(screen.getByPlaceholderText("Repite Contraseña de Registro"), { target: { value: "secret123" } });

    mutationOptions[0].onSuccess("Cuenta creada");

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Cuenta creada");
      expect(screen.getByPlaceholderText("Email de Registro")).toHaveValue("");
      expect(screen.getByPlaceholderText("Nombre de Registro")).toHaveValue("");
      expect(screen.getByPlaceholderText("Contraseña de Registro")).toHaveValue("");
      expect(screen.getByPlaceholderText("Repite Contraseña de Registro")).toHaveValue("");
    });
  });

  test("debe mostrar toast cuando el registro falla", () => {
    render(
      <MemoryRouter>
        <RegisterView />
      </MemoryRouter>
    );

    mutationOptions[0].onError(new Error("No se pudo registrar"));

    expect(toast.error).toHaveBeenCalledWith("No se pudo registrar");
  });
});
