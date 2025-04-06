import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserRouter, useRouteError } from "react-router-dom";
import ErrorPage from "../ErrorPage";

// Mock the useRouteError hook
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouteError: vi.fn(),
    Link: ({ to, children, className }) => (
      <a href={to} className={className} data-testid="link">
        {children}
      </a>
    ),
  };
});

describe("ErrorPage", () => {
  // Mock window.location.reload
  const reloadMock = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    delete window.location;
    window.location = { reload: reloadMock };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it("renders error message from useRouteError", () => {
    // Setup mock error
    useRouteError.mockReturnValue({
      message: "Test error message",
      status: 404,
    });

    render(
      <BrowserRouter>
        <ErrorPage />
      </BrowserRouter>
    );

    // Check that error message is displayed
    expect(screen.getByText("Test error message")).toBeInTheDocument();
    expect(screen.getByText("Código de estado: 404")).toBeInTheDocument();
  });

  it("handles retry button click", () => {
    useRouteError.mockReturnValue({ message: "Error" });

    render(
      <BrowserRouter>
        <ErrorPage />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText("Reintentar"));
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("renders home link correctly", () => {
    useRouteError.mockReturnValue({ message: "Error" });

    render(
      <BrowserRouter>
        <ErrorPage />
      </BrowserRouter>
    );

    const homeLink = screen.getByText("Ir al inicio");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");
  });
});
