import React, { useState, useEffect } from "react";
import { Form, Button, Container, Card, Image } from "react-bootstrap";

function UpdateProfileForm({ userId, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Username: "",
    Gender: "",
    PhoneNumber: "",
    DateOfBirth: "",
    Image: "",
    Email: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(`http://localhost:5000/customer/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          FirstName: data.FirstName || "",
          LastName: data.LastName || "",
          Username: data.Username || "",
          Gender: data.Gender || "",
          PhoneNumber: data.PhoneNumber || "",
          DateOfBirth: data.DateOfBirth ? data.DateOfBirth.slice(0, 10) : "",
          Image: data.Image || "",
          Email: data.Email || "",

        });
      })
      .catch((err) => console.error("Error loading user info:", err));
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.FirstName.trim()) newErrors.FirstName = "First name is required";
    if (!formData.LastName.trim()) newErrors.LastName = "Last name is required";
    if (!formData.Username.trim()) newErrors.Username = "Username is required";
    if (!formData.Gender) newErrors.Gender = "Gender is required";
    if (!formData.DateOfBirth) {
      newErrors.DateOfBirth = "Date of birth is required";
    } else {
      const selectedDate = new Date(formData.DateOfBirth);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // reset giờ để so sánh chính xác theo ngày
      if (selectedDate > today) {
        newErrors.DateOfBirth = "Date of birth cannot be in the future";
      }
    }
    if (!formData.PhoneNumber.match(/^\d{10,11}$/)) newErrors.PhoneNumber = "Phone must be 10–11 digits";
    // if (formData.Image && !formData.Image.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|png)/i)) {
    //   newErrors.Image = "Image must be a valid image URL";
    // }
    if (!formData.Email.trim()) {
      newErrors.Email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      newErrors.Email = "Invalid email address";
    }


    return newErrors;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/customer/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Update successful!");
        if (onUpdateSuccess) onUpdateSuccess();
      } else {
        const errData = await res.json();
        alert("Update failed: " + (errData.message || "Server error"));
      }
    } catch (err) {
      alert("Server connection error");
    }
  };

  return (
    <Container style={{ maxWidth: "500px", background: "#f0f2f5" }} className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow border-0 w-100" style={{ borderRadius: "18px", background: "#fff" }}>
        <Card.Body className="p-4">
          <div className="d-flex flex-column align-items-center mb-4">
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                overflow: "hidden",
                border: "4px solid #1877f2",
                boxShadow: "0 2px 8px rgba(24,119,242,0.15)",
                marginBottom: 10,
                background: "#e4e6eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {formData.Image ? (
                <Image
                  src={formData.Image}
                  roundedCircle
                  width="120"
                  height="120"
                  alt="Avatar"
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              ) : (
                <span style={{ color: "#b0b3b8", fontSize: 48 }}>👤</span>
              )}
            </div>
            <h4 className="fw-bold mb-1" style={{ color: "#050505" }}>
              {formData.FirstName} {formData.LastName}
            </h4>
            <div className="text-muted mb-2" style={{ fontSize: 15 }}>
              @{formData.Username}
            </div>
          </div>
          <Form onSubmit={handleUpdate}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ color: "#65676b" }}>Avatar (URL)</Form.Label>
              <Form.Control
                type="text"
                name="Image"
                placeholder="Paste avatar image URL"
                value={formData.Image}
                onChange={handleChange}
                isInvalid={!!errors.Image}
                style={{ background: "#f0f2f5", border: "none", borderRadius: 8 }}
              />
              <Form.Control.Feedback type="invalid">{errors.Image}</Form.Control.Feedback>
            </Form.Group>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label className="fw-semibold" style={{ color: "#65676b" }}>First Name</Form.Label>
                <Form.Control
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  isInvalid={!!errors.FirstName}
                  style={{ background: "#f0f2f5", border: "none", borderRadius: 8 }}
                />
                <Form.Control.Feedback type="invalid">{errors.FirstName}</Form.Control.Feedback>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label className="fw-semibold" style={{ color: "#65676b" }}>Last Name</Form.Label>
                <Form.Control
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  isInvalid={!!errors.LastName}
                  style={{ background: "#f0f2f5", border: "none", borderRadius: 8 }}
                />
                <Form.Control.Feedback type="invalid">{errors.LastName}</Form.Control.Feedback>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold" style={{ color: "#65676b" }}>Username</Form.Label>
              <Form.Control
                name="Username"
                value={formData.Username}
                onChange={handleChange}
                placeholder="Enter username"
                isInvalid={!!errors.Username}
                style={{ background: "#f0f2f5", border: "none", borderRadius: 8 }}
              />
              <Form.Control.Feedback type="invalid">{errors.Username}</Form.Control.Feedback>
            </Form.Group>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Label className="fw-semibold" style={{ color: "#65676b" }}>Gender</Form.Label>
                <Form.Select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                  isInvalid={!!errors.Gender}
                  style={{ background: "#f0f2f5", border: "none", borderRadius: 8 }}
                >
                  <option value="">-- Select --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.Gender}</Form.Control.Feedback>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Label className="fw-semibold" style={{ color: "#65676b" }}>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="DateOfBirth"
                  max={new Date().toISOString().split("T")[0]} // giới hạn chọn ngày <= hôm nay
                  value={formData.DateOfBirth}
                  onChange={handleChange}
                  isInvalid={!!errors.DateOfBirth}
                  style={{ background: "#f0f2f5", border: "none", borderRadius: 8 }}
                />
                <Form.Control.Feedback type="invalid">{errors.DateOfBirth}</Form.Control.Feedback>
              </div>
            </div>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold" style={{ color: "#65676b" }}>Phone Number</Form.Label>
              <Form.Control
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                isInvalid={!!errors.PhoneNumber}
                style={{ background: "#f0f2f5", border: "none", borderRadius: 8 }}
              />
              <Form.Control.Feedback type="invalid">{errors.PhoneNumber}</Form.Control.Feedback>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 fw-bold"
              size="lg"
              style={{
                fontSize: "1.1rem",
                background: "#1877f2",
                border: "none",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(24,119,242,0.15)"
              }}
            >
              Update Profile
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UpdateProfileForm;
