import React, { useEffect, useState } from "react";
import {
  Card,
  Spinner,
  Container,
  Row,
  Col,
  Image,
  Modal,
  Button,
} from "react-bootstrap";
import UpdateProfileForm from "../components/UpdateProfileForm";
import '../App.css';
import '../style/customer/ProfilePage.css';


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
    <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card
        className="shadow-lg border-0"
        style={{ width: "100%", maxWidth: "520px", borderRadius: "20px" }}
      >
        <Card.Body className="p-4">
          <div className="d-flex flex-column align-items-center mb-4">
            <div
              style={{
                border: "4px solid #0d6efd",
                borderRadius: "50%",
                padding: "6px",
                // background: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)",
                marginBottom: "12px",
              }}
            >
              <Image
                src={user.Image || "/default-avatar.png"}
                roundedCircle
                alt="Avatar"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  boxShadow: "0 4px 24px rgba(13,110,253,0.15)",
                }}
              />
            </div>
            <h4 className="fw-bold mb-1">
              {user.FirstName} {user.LastName}
            </h4>
            <span className="text-muted">
              {user.Username ? `@${user.Username}` : user.Email}
            </span>
          </div>
          <hr />
          <Row className="mb-3">
            <Col xs={5} className="fw-semibold text-secondary">
              Email
            </Col>
            <Col xs={7} className="text-break">
              {user.Email || "-"}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={5} className="fw-semibold text-secondary">
              Gender
            </Col>
            <Col xs={7}>{user.Gender || "-"}</Col>
          </Row>
          <Row className="mb-3">
            <Col xs={5} className="fw-semibold text-secondary">
              Date of Birth
            </Col>
            <Col xs={7}>
              {user.DateOfBirth
                ? new Date(user.DateOfBirth).toLocaleDateString()
                : "-"}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={5} className="fw-semibold text-secondary">
              Phone
            </Col>
            <Col xs={7}>{user.PhoneNumber || "-"}</Col>
          </Row>
          <div className="d-grid mt-4">
            <Button
              variant="primary"
              size="lg"
              className="rounded-pill fw-semibold"
              onClick={handleShowModal}
              style={{
                // background: "linear-gradient(90deg, #0d6efd 60%, #4f8cff 100%)",
                border: "none",
                boxShadow: "0 2px 12px rgba(13,110,253,0.10)",
              }}
            >
              <i className="bi bi-pencil-square me-2"></i>
              Update Profile
            </Button>
          </div>
        </Card.Body>
      </Card>
      <Modal
        show={showUpdateModal}
        onHide={handleCloseModal}
        size="md"
        centered
        contentClassName="border-0 rounded-4"
        dialogClassName="modal-dialog-centered"
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title as="h5" className="fw-bold">
            Update Personal Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 pb-4 px-4">
          <UpdateProfileForm userId={userId} />
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ProfileView;
