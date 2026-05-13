import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RegisterView from "./RegisterView";

const queryClient = new QueryClient();

describe("RegisterView", () => {
  test("debe renderizar el formulario de registro", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegisterView />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Crear Cuenta")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email de Registro")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre de Registro")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Registrarme")).toBeInTheDocument();
  });
});