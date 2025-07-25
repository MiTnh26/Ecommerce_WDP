import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

// Inline Error Message Component
const InlineError = ({ message, show }) => {
  if (!show || !message) return null;

  return (
    <div
      className="alert alert-danger d-flex align-items-center mt-2 py-2 px-3"
      style={{
        fontSize: "0.875rem",
        borderRadius: "8px",
        border: "1px solid #f5c6cb",
        backgroundColor: "#f8d7da",
        color: "#721c24",
      }}
    >
      <i
        className="bi bi-exclamation-triangle-fill me-2"
        style={{ fontSize: "1rem" }}
      ></i>
      <span>{message}</span>
    </div>
  );
};

// Success Message Component
const InlineSuccess = ({ message, show }) => {
  if (!show || !message) return null;

  return (
    <div
      className="alert alert-success d-flex align-items-center mt-2 py-2 px-3"
      style={{
        fontSize: "0.875rem",
        borderRadius: "8px",
        border: "1px solid #c3e6cb",
        backgroundColor: "#d4edda",
        color: "#155724",
      }}
    >
      <i
        className="bi bi-check-circle-fill me-2"
        style={{ fontSize: "1rem" }}
      ></i>
      <span>{message}</span>
    </div>
  );
};

function Login() {
  const [Email, setEmail] = useState("");
  const [Password, setPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Error states for each field
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
    google: "",
  });

  // Success state
  const [success, setSuccess] = useState("");

  // Clear all errors
  const clearErrors = () => {
    setErrors({
      email: "",
      password: "",
      general: "",
      google: "",
    });
    setSuccess("");
  };

  const navigate = useNavigate();

  // Validate email
  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Invalid email format";
    }
    return "";
  };

  // Validate password
  const validatePassword = (password) => {
    if (!password.trim()) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  // Handle email change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    // Clear email error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPass(value);

    // Clear password error when user starts typing
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    // Validate form
    const emailError = validateEmail(Email);
    const passwordError = validatePassword(Password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        general: "",
        google: "",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ Email, Password: Password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setSuccess("Login successful!");

        // Redirect after 2 seconds
        setTimeout(() => {
          if (data.user && data.user.UserRole === "Admin") {
            window.location.href = "http://localhost:3000/Ecommerce/admin/admin-dashboard";
          } else {
            navigate("/Ecommerce/home");
          }
        }, 2000);
      } else {
        setErrors((prev) => ({
          ...prev,
          general: data.message || "Incorrect email or password",
        }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: "Server connection error. Please try again later.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    clearErrors();
    setIsLoading(true);

    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await fetch("http://localhost:5000/customer/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      console.log("data", data);

      if (res.ok) {
        setSuccess("Google login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect after 2 seconds
        setTimeout(() => {
          if (data.user && data.user.UserRole === "Admin") {
            window.location.href = "http://localhost:3000/Ecommerce/admin/admin-dashboard";
          } else {
            navigate("/Ecommerce/home");
          }
        }, 2000);
      } else {
        setErrors((prev) => ({
          ...prev,
          google: data.message || "Google login failed",
        }));
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({
        ...prev,
        google: "Error processing Google login. Please try again.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors((prev) => ({
      ...prev,
      google: "Google login failed. Please try again.",
    }));
  };

  return (
    <div>
      {/* Bootstrap Icons CDN */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
      />

      {/* HEADER */}
      <div className="d-flex align-items-center p-3">
        <a
          href="/Ecommerce/home"
          className="d-flex align-items-center text-decoration-none"
        >
          <img
            src="/logo-ecommerce.jpg"
            alt="Logo"
            style={{ height: "40px", marginRight: "8px" }}
          />
        </a>
        <span style={{ fontSize: "18px", marginLeft: "20px" }}>Đăng nhập</span>
      </div>

      {/* FORM LOGIN */}
      <section className="vh-100">
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-md-9 col-lg-6 col-xl-5">
              <img
                src="/logo-ecommerce.jpg"
                className="img-fluid"
                alt="login illustration"
              />
            </div>

            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <form onSubmit={handleSubmit}>
                {/* General Success Message */}
                <InlineSuccess message={success} show={!!success} />

                {/* General Error Message */}
                <InlineError message={errors.general} show={!!errors.general} />

                <div className="mb-4">
                  <label className="form-label">Email:</label>
                  <input
                    type="email"
                    className={`form-control form-control-lg ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Enter email"
                    value={Email}
                    onChange={handleEmailChange}
                    required
                  />
                  <InlineError message={errors.email} show={!!errors.email} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password:</label>
                  <input
                    type="password"
                    className={`form-control form-control-lg ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="Enter password"
                    value={Password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <InlineError
                    message={errors.password}
                    show={!!errors.password}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <a href="/Ecommerce/forgot-password" className="text-body">
                    Forgot password?
                  </a>
                </div>

                <div className="text-center text-lg-start mt-4 pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>

                  <div className="my-3 text-center">Or</div>

                  <div className="d-flex justify-content-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={handleGoogleError}
                    />
                  </div>

                  {/* Google Error Message */}
                  <InlineError message={errors.google} show={!!errors.google} />

                  <p className="small fw-bold mt-2 pt-1 mb-0">
                    Don't have an account?{" "}
                    <a href="/Ecommerce/register" className="link-danger">
                      Register
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
