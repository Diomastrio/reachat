import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "../LoginPage";
import { useAuthStore } from "../../store/useAuthStore";

// Mock the auth store
vi.mock("../../store/useAuthStore", () => ({
  useAuthStore: vi.fn(),
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Update the ReCAPTCHA mock to work synchronously
vi.mock("react-google-recaptcha", () => {
  const ReCAPTCHAMock = vi.fn((props) => {
    // Call onChange synchronously without setTimeout
    if (props.onChange) {
      props.onChange("test-recaptcha-token");
    }
    return <div data-testid="recaptcha">ReCAPTCHA</div>;
  });
  return { default: ReCAPTCHAMock };
});

describe("LoginPage", () => {
  const loginMock = vi.fn();

  beforeEach(() => {
    useAuthStore.mockReturnValue({
      login: loginMock,
      isLoggingIn: false,
    });
  });

  it("renders login form correctly", () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("handles form submission correctly", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });

    // No need to manually trigger the onChange as our mock now does it synchronously
    // The recaptchaToken state should be already set by the mock

    // Submit the form
    fireEvent.click(screen.getByText("Sign in"));

    // Wait for the login to be called
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        recaptchaToken: "test-recaptcha-token",
      });
    });
  });

  it("shows loading state when submitting", () => {
    useAuthStore.mockReturnValue({
      login: loginMock,
      isLoggingIn: true,
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    // Use the data-testid attribute
    const loginButton = screen.getByTestId("login-button");
    expect(loginButton).toBeDisabled();

    // Verify loading text is displayed
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });
});
