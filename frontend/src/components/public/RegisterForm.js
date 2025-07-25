import React, { useState } from "react";
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
      e.Username = "Username phải từ 5 đến 30 ký tự.";
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/.test(form.Password)) {
      e.Password =
        "Password phải có ít nhất 6 ký tự, 1 số, 1 chữ, 1 ký tự đặc biệt.";
    }

    if (!form.Email.endsWith("@gmail.com")) {
      e.Email = "Email phải có đuôi @gmail.com";
    }

    if (!/^\d{10,}$/.test(form.PhoneNumber)) {
      e.PhoneNumber = "Số điện thoại phải từ 10 chữ số và chỉ chứa số.";
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
        alert("Đăng ký thành công!");
        // có thể reset form hoặc chuyển trang login
        navigate("/Ecommerce/login"); // chuyển hướng sang login sau 1 giây
      } else {
        alert(data.message || "Đăng ký thất bại");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
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
          <h4 className="ms-4 mb-0">Đăng ký</h4>
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
                  Số điện thoại:
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
                  Giới tính:
                </Form.Label>
                <div className="mt-2">
                  <Form.Check
                    inline
                    type="radio"
                    name="Gender"
                    value="Male"
                    checked={form.Gender === "Male"}
                    onChange={handleChange}
                    label="Nam"
                    id="male"
                  />
                  <Form.Check
                    inline
                    type="radio"
                    name="Gender"
                    value="Female"
                    checked={form.Gender === "Female"}
                    onChange={handleChange}
                    label="Nữ"
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
                Đăng ký
              </Button>

              <div className="text-center my-3">
                <span className="text-muted">hoặc</span>
              </div>

              <div className="text-center mt-4">
                <span className="text-muted">Đã có tài khoản? </span>
                <a
                  href="/Ecommerce/login"
                  className="text-decoration-none"
                  style={{ color: "#d63384" }}
                >
                  Đăng nhập
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
