import React, { useEffect, useState } from "react";
import { Card, Spinner, Container, Row, Col, Image, Modal, Button } from "react-bootstrap";
import UpdateProfileForm from "../components/UpdateProfileForm";
function ProfileView({ userId }) {
  const [user, setUser] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);



  // useEffect(() => {
  //   fetch(`http://localhost:5000/customer/profile/${userId}`)
  //     .then((res) => res.json())
  //     .then((data) => setUser(data))
  //     .catch((err) => console.error("Lỗi khi lấy thông tin user:", err));
  // }, [userId]);
  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/customer/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Data fetch thành công:", data); // <-- log ra data tại đây
        setUser(data);
      })
      .catch((err) => console.error("❌ Lỗi khi lấy thông tin user:", err));
  }, [userId]);






  const handleCloseModal = () => setShowUpdateModal(false);
  const handleShowModal = () => setShowUpdateModal(true);

  if (!user) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Personal Information</h4>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col xs={12} className="text-center">
              <Image
                src={user.Image || "/default-avatar.png"}
                roundedCircle
                alt="Avatar"
                style={{ width: "130px", height: "130px", objectFit: "cover" }}
              />
            </Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4} className="fw-semibold">Email:</Col>
            <Col sm={8}>{user.Email || "-"}</Col>
          </Row>
          {user.Username && (
            <Row className="mb-2">
              <Col sm={4} className="fw-semibold">Username:</Col>
              <Col sm={8}>{user.Username}</Col>
            </Row>
          )}

          <Row className="mb-2">
            <Col sm={4} className="fw-semibold">Full Name:</Col>
            <Col sm={8}>{user.FirstName} {user.LastName}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4} className="fw-semibold">Gender:</Col>
            <Col sm={8}>{user.Gender || "-"}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4} className="fw-semibold">Date of Birth:</Col>
            <Col sm={8}>
              {user.DateOfBirth
                ? new Date(user.DateOfBirth).toLocaleDateString()
                : "-"}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4} className="fw-semibold">Phone Number:</Col>
            <Col sm={8}>{user.PhoneNumber || "-"}</Col>
          </Row>
        </Card.Body>
        <Button variant="primary" onClick={handleShowModal}>
          Update Profile
        </Button>
      </Card>
      <Modal show={showUpdateModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <h4 className="mb-0">Update Personal Profile</h4>
        </Modal.Header>
        <UpdateProfileForm userId={userId} />
      </Modal>
    </Container>
  );
}

export default ProfileView;
