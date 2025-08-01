import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const RegisterForm = () => {
  const navigate = useNavigate(); // hook chuyển hướng

  const [form, setForm] = useState({
    Username: "",
    Password: "",
    Email: "",
    PhoneNumber: "",
    Gender: "Male",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (form.Username.length < 5 || form.Username.length > 30) {
      e.Username = "Username must be between 5 and 30 characters.";
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(form.Password)) {
      e.Password =
        "Password must be at least 6 characters, include a number, a letter, and a special character.";
    }

    if (!form.Email.endsWith("@gmail.com")) {
      e.Email = "Email must end with @gmail.com";
    }

    if (!/^\d{10,}$/.test(form.PhoneNumber)) {
      e.PhoneNumber = "Phone number must be at least 10 digits and contain only numbers.";
    }

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/customer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
        credentials: "include", // nếu cần gửi cookie session
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");
        // có thể reset form hoặc chuyển trang login
        navigate("/Ecommerce/login"); // chuyển hướng sang login sau 1 giây
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      alert("Server connection error");
    }
  };

  return (
    <div className="min-vh-100 d-flex">
      {/* Left side - Logo section */}
      <div
        className="col-md-6 d-none d-md-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#f5f1e8" }}
      >
        <div className="text-center">
          <div className="mb-4">
            <img
              src="/logo-ecommerce.jpg"
              className="img-fluid"
              alt="login illustration"
            />
          </div>
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="col-md-6 d-flex flex-column">
        {/* Header */}
        <div className="d-flex align-items-center p-4 border-bottom">
          <h4 className="ms-4 mb-0">Register</h4>
        </div>

        {/* Form content */}
        <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <Form onSubmit={handleSubmit} noValidate>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  Username:
                </Form.Label>
                <Form.Control
                  type="text"
                  name="Username"
                  value={form.Username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="py-2"
                  style={{ border: "1px solid #dee2e6", borderRadius: "4px" }}
                  isInvalid={!!errors.Username}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Username}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  Password:
                </Form.Label>
                <Form.Control
                  type="password"
                  name="Password"
                  value={form.Password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="py-2"
                  style={{ border: "1px solid #dee2e6", borderRadius: "4px" }}
                  isInvalid={!!errors.Password}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Password}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  Email:
                </Form.Label>
                <Form.Control
                  type="email"
                  name="Email"
                  value={form.Email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="py-2"
                  style={{ border: "1px solid #dee2e6", borderRadius: "4px" }}
                  isInvalid={!!errors.Email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.Email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold text-dark">
                  Phone number:
                </Form.Label>
                <Form.Control
                  type="text"
                  name="PhoneNumber"
                  value={form.PhoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="py-2"
                  style={{ border: "1px solid #dee2e6", borderRadius: "4px" }}
                  isInvalid={!!errors.PhoneNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.PhoneNumber}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-dark">
                  Gender:
                </Form.Label>
                <div className="mt-2">
                  <Form.Check
                    inline
                    type="radio"
                    name="Gender"
                    value="Male"
                    checked={form.Gender === "Male"}
                    onChange={handleChange}
                    label="Male"
                    id="male"
                  />
                  <Form.Check
                    inline
                    type="radio"
                    name="Gender"
                    value="Female"
                    checked={form.Gender === "Female"}
                    onChange={handleChange}
                    label="Female"
                    id="female"
                  />
                </div>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2 fw-semibold"
                style={{
                  backgroundColor: "#007bff",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Register
              </Button>

              <div className="text-center my-3">
                <span className="text-muted">or</span>
              </div>

              <div className="text-center mt-4">
                <span className="text-muted">Already have an account? </span>
                <a
                  href="/Ecommerce/login"
                  className="text-decoration-none"
                  style={{ color: "#d63384" }}
                >
                  Login
                </a>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
