import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  Container,
  Row,
  Col,
  Image,
  Modal,
  Button,
  Form,
  ListGroup,
  Badge,
  Spinner,
} from "react-bootstrap";

function AddressForm({ userId }) {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [newAddress, setNewAddress] = useState({
    address: "",
    phoneNumber: "",
    receiverName: "",
  });

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/customer/profile/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không lấy được thông tin user");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        console.error("❌ Lỗi khi lấy user:", err);
        alert("Không thể tải dữ liệu người dùng");
      });
  }, [userId]);

  const handleShowModal = () => setShowModal(true);




  const handleChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleSubmitAddress = async () => {
    if (!newAddress.address || !newAddress.phoneNumber || !newAddress.receiverName) {
      return alert("❗ Vui lòng điền đầy đủ thông tin địa chỉ.");
    }

    const url = isEditing
      ? `http://localhost:5000/customer/user/${userId}/address/${editingAddressId}`
      : `http://localhost:5000/customer/user/${userId}/address`;

    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAddress,
          phoneNumber: Number(newAddress.phoneNumber),
          status: newAddress.status || "Inactive",
        }),
      });

      if (!res.ok) throw new Error("Lỗi khi gửi địa chỉ");

      const profileRes = await fetch(`http://localhost:5000/customer/profile/${userId}`);
      const updatedUser = await profileRes.json();
      setUser(updatedUser);

      setShowModal(false);
      setNewAddress({ address: "", phoneNumber: "", receiverName: "" });
      setIsEditing(false);
      setEditingAddressId(null);

      alert(isEditing ? "✅ Cập nhật địa chỉ thành công!" : "✅ Thêm địa chỉ thành công!");
    } catch (error) {
      console.error("❌ Lỗi:", error);
      alert(isEditing ? "Cập nhật địa chỉ thất bại!" : "Thêm địa chỉ thất bại!");
    }
  };


  if (!user) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }
  const handleEditAddress = (addr) => {
    setIsEditing(true);
    setEditingAddressId(addr._id);
    setNewAddress({
      address: addr.address,
      phoneNumber: addr.phoneNumber.toString(),
      receiverName: addr.receiverName,
      status: addr.status,
    });
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setNewAddress({ address: "", phoneNumber: "", receiverName: "" });
    setIsEditing(false);
    setEditingAddressId(null);
  };
  const handleDeleteAddress = async (addressId) => {
    const addressToDelete = user.ShippingAddress.find((addr) => addr._id === addressId);
    if (addressToDelete?.status === "Default") {
      alert("❗ Không thể xoá địa chỉ mặc định.");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xoá địa chỉ này?")) return;

    try {
      const res = await fetch(`http://localhost:5000/customer/user/${userId}/address/${addressId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Lỗi xoá địa chỉ");

      const updatedUserRes = await fetch(`http://localhost:5000/customer/profile/${userId}`);
      const updatedUser = await updatedUserRes.json();
      setUser(updatedUser);

      alert("✅ Đã xoá địa chỉ!");
    } catch (err) {
      console.error("❌ Lỗi xoá địa chỉ:", err);
      alert("Xoá địa chỉ thất bại!");
    }
  };



  return (
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <Card className="shadow-sm">
        <Card.Header className="bg-success text-white">
          <h4 className="mb-0">Shipping Address</h4>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4 text-center">
            <Image
              src={user.Image || "/default-avatar.png"}
              roundedCircle
              alt="Avatar"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                margin: "auto",
              }}
            />
          </Row>
          <Row className="mb-2">
            <Col sm={4} className="fw-semibold">Full Name:</Col>
            <Col sm={8}>{user.FirstName} {user.LastName}</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4} className="fw-semibold">Email:</Col>
            <Col sm={8}>{user.Email}</Col>
          </Row>
          <hr />
          <h5>Address List:</h5>
          <ListGroup>
            {user.ShippingAddress?.map((addr) => (
              <ListGroup.Item key={addr._id || addr.id || addr.address}>
                <div className="fw-semibold">{addr.receiverName}</div>
                <div>{addr.address}</div>
                <div>Phone: {addr.phoneNumber}</div>
                {addr.status === "Default" && (
                  <Badge bg="primary" className="mt-1">Default</Badge>
                )}
                <div className="mt-2 text-end">
                  <Button variant="outline-primary" size="sm" onClick={() => handleEditAddress(addr)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteAddress(addr._id)}
                    disabled={addr.status === "Default"}
                  >
                    Delete
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
            {user.ShippingAddress?.length === 0 && (
              <div className="text-muted">No addresses yet</div>
            )}
          </ListGroup>
          <div className="text-end mt-3">
            <Button variant="success" onClick={handleShowModal}>Add Address</Button>
          </div>
        </Card.Body>
      </Card>

      {/* Add Address Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Update Address" : "New Address"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Receiver Name</Form.Label>
              <Form.Control
                name="receiverName"
                value={newAddress.receiverName}
                onChange={handleChange}
                placeholder="Nguyễn Văn AA"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                name="address"
                value={newAddress.address}
                onChange={handleChange}
                placeholder="Ngõ 121, Đường Trần Phú, Hà Đông, Hà Nội"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                name="phoneNumber"
                value={newAddress.phoneNumber}
                onChange={handleChange}
                placeholder="0901234567"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address Status</Form.Label>
              <Form.Select
                name="status"
                value={newAddress.status || "Inactive"}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, status: e.target.value })
                }
              >
                <option value="Inactive">Not Default</option>
                <option value="Default">Default</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="success" onClick={handleSubmitAddress}>
            {isEditing ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
AddressForm.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default AddressForm;
