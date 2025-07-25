/**
 * @jest-environment jsdom
 */

// 1) Hoist this mock above any imports
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const real = jest.requireActual("react-router-dom");
  return {
    ...real,
    useNavigate: () => mockNavigate,
  };
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "../../src/pages/public/RegisterPage";
import { MemoryRouter } from "react-router-dom";

beforeAll(() => jest.spyOn(console, "error").mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

describe("Register flow (integration w/ fetch-mock)", () => {
  beforeEach(() => {
    fetch.resetMocks();
    mockNavigate.mockClear();
  });

  it("shows validation errors with empty form", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    expect(
      await screen.findByText(/Username must be between 5 and 30 characters./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Password must be at least 6 characters, include a number, a letter, and a special character./i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Email must end with @gmail.com/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Phone number must be at least 10 digits and contain only numbers./i)
    ).toBeInTheDocument();
  });

  it("submits successfully and navigates to login", async () => {
    // stub network
    fetch.mockResponseOnce(JSON.stringify({ message: "OK" }), { status: 200 });

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // fill inputs by placeholder
    fireEvent.change(screen.getByPlaceholderText(/Enter username/i), {
      target: { value: "alice123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
      target: { value: "Aa1!aa" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
      target: { value: "alice@gmail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter phone number/i), {
      target: { value: "0123456789" },
    });

    // submit
    fireEvent.click(screen.getByRole("button", { name: /Register/i }));

    await waitFor(() => {
      // verify fetch
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/customer/register",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Username: "alice123",
            Password: "Aa1!aa",
            Email: "alice@gmail.com",
            PhoneNumber: "0123456789",
            Gender: "Male",
          }),
          credentials: "include",
        })
      );
      // now our single mockNavigate should have been called
      expect(mockNavigate).toHaveBeenCalledWith("/Ecommerce/login");
    });
  });
});
