import React, { useState, useEffect } from "react";
import { Form, Button, Container, Card, Image } from "react-bootstrap";

function UpdateProfileForm({ userId }) {
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    Username: "",
    Gender: "",
    PhoneNumber: "",
    DateOfBirth: "",
    Image: "",
  });

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
        });
      })
      .catch((err) => console.error("Error loading user info:", err));
  }, [userId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/customer/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Update successful!");
      } else {
        const errData = await res.json();
        alert("Update failed: " + (errData.message || "Server error"));
      }
    } catch (err) {
      alert("Server connection error");
    }
  };

  return (
    // <Container style={{ maxWidth: "650px" }} className="mt-5 mb-5">
    <Card className="shadow-sm rounded">
      <Card.Body>
        {formData.Image && (
          <div className="text-center mb-4">
            <Image
              src={formData.Image}
              roundedCircle
              width="120"
              height="120"
              alt="Avatar"
            />
          </div>
        )}

        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-3">
            <Form.Label>Avatar (URL)</Form.Label>
            <Form.Control
              type="text"
              name="Image"
              placeholder="Paste avatar image URL"
              value={formData.Image}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3"></Form.Group>
          {formData.Username?.trim() && (
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                name="Username"
                value={formData.Username}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </Form.Group>
          )}


          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              name="FirstName"
              value={formData.FirstName}
              onChange={handleChange}
              placeholder="Enter first name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              name="LastName"
              value={formData.LastName}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
            >
              <option value="">-- Select --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control
              type="date"
              name="DateOfBirth"
              value={formData.DateOfBirth}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              name="PhoneNumber"
              value={formData.PhoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 fw-semibold"
            size="lg"
            style={{ fontSize: "1.1rem" }}
          >
            Update
          </Button>
        </Form>
      </Card.Body>
    </Card>
    // </Container>
  );
}

export default UpdateProfileForm;
