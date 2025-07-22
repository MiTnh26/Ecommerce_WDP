import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import '../style/customer/ChangePasswordForm.css'
const user = JSON.parse(localStorage.getItem("user"));

let userId = "0";
try {
    userId = user._id;
    console.log("userid", userId);
} catch (error) {
    console.error(error);
}

// Password validation regex: 
// At least 1 uppercase, 1 lowercase, 1 number, 1 special char, min 8 chars
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

function ChangePasswordForm({ userId }) {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [message, setMessage] = useState(null);
    const [variant, setVariant] = useState("danger");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwordRegex.test(formData.newPassword)) {
            setMessage(
                "New password must be at least 8 characters, include uppercase, lowercase, number, and special character."
            );
            setVariant("danger");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage("New password does not match!");
            setVariant("danger");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/customer/change-password/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (res.ok) {
                setVariant("success");
                setMessage("Password changed successfully!");
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
            } else {
                setVariant("danger");
                setMessage(result.message || "An error occurred");
            }
        } catch (err) {
            setVariant("danger");
            setMessage("Cannot connect to server.");
        }
    };

    return (
        <Form onSubmit={handleSubmit}  className="change-password-form">
             <h5 className="mb-3"> </h5>
           
            <h5 className="mb-3">Change Password</h5>

            {message && <Alert variant={variant}>{message}</Alert>}

            <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
            </Form.Group>

            <Button type="submit" variant="primary">
                Confirm
            </Button>
        </Form>
    );
}

export default ChangePasswordForm;
