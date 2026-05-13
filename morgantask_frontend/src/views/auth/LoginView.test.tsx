import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginView from "./LoginView";

const queryClient = new QueryClient();

describe("LoginView", () => {
  test("debe renderizar el formulario de inicio de sesión", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoginView />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email de Registro")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña de Registro")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Iniciar Sesión")).toBeInTheDocument();
    expect(screen.getByText("¿No tienes cuenta? Crear Una")).toBeInTheDocument();
  });
});