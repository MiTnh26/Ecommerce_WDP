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
    <Container className="mt-5 d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <Card className="shadow-lg border-0 w-100" style={{ maxWidth: "650px", borderRadius: "18px" }}>
        <Card.Header
          className="bg-gradient"
          style={{
            background: "linear-gradient(90deg, #43cea2 0%, #185a9d 100%)",
            color: "#fff",
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px",
            borderBottom: "none",
            padding: "2rem 1.5rem"
          }}
        >
          <div className="d-flex align-items-center">
            <Image
              src={user.Image || "/default-avatar.png"}
              roundedCircle
              alt="Avatar"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                border: "3px solid #fff",
                marginRight: "1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
              }}
            />
            <div>
              <h4 className="mb-1 fw-bold">{user.FirstName} {user.LastName}</h4>
              <div className="text-light small">{user.Email}</div>
            </div>
          </div>
        </Card.Header>
        <Card.Body style={{ background: "#f8fafc", borderBottomLeftRadius: "18px", borderBottomRightRadius: "18px" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Shipping Addresses</h5>
            <Button
              variant="success"
              onClick={handleShowModal}
              style={{
                borderRadius: "20px",
                fontWeight: "500",
                boxShadow: "0 2px 8px rgba(67,206,162,0.08)"
              }}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Address
            </Button>
          </div>
          <ListGroup variant="flush" className="mb-2">
            {user.ShippingAddress?.map((addr) => (
              <ListGroup.Item
                key={addr._id || addr.id || addr.address}
                className="mb-3 shadow-sm rounded border-0"
                style={{
                  background: "#fff",
                  position: "relative",
                  padding: "1.25rem 1rem"
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold fs-6 mb-1">
                      <i className="bi bi-person-circle me-2 text-primary"></i>
                      {addr.receiverName}
                    </div>
                    <div className="text-muted mb-1">
                      <i className="bi bi-geo-alt-fill me-2 text-success"></i>
                      {addr.address}
                    </div>
                    <div className="text-muted mb-2">
                      <i className="bi bi-telephone-fill me-2 text-info"></i>
                      {addr.phoneNumber}
                    </div>
                    {addr.status === "Default" && (
                      <Badge bg="primary" className="me-2" style={{ fontSize: "0.85em" }}>
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="px-3"
                      onClick={() => handleEditAddress(addr)}
                      style={{ borderRadius: "16px" }}
                    >
                      <i className="bi bi-pencil-square me-1"></i>Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="px-3"
                      onClick={() => handleDeleteAddress(addr._id)}
                      disabled={addr.status === "Default"}
                      style={{ borderRadius: "16px" }}
                    >
                      <i className="bi bi-trash me-1"></i>Delete
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
            {user.ShippingAddress?.length === 0 && (
              <div className="text-muted text-center py-4">
                <i className="bi bi-geo-alt fs-3"></i>
                <div>No addresses yet</div>
              </div>
            )}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Add/Edit Address Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        contentClassName="rounded-4"
        dialogClassName="modal-dialog-centered"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            {isEditing ? "Update Address" : "Add New Address"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Receiver Name</Form.Label>
              <Form.Control
                name="receiverName"
                value={newAddress.receiverName}
                onChange={handleChange}
                placeholder="Nguyễn Văn AA"
                autoFocus
                autoComplete="off"
                maxLength={50}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Address</Form.Label>
              <Form.Control
                name="address"
                value={newAddress.address}
                onChange={handleChange}
                placeholder="Ngõ 121, Đường Trần Phú, Hà Đông, Hà Nội"
                autoComplete="off"
                maxLength={120}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Phone Number</Form.Label>
              <Form.Control
                name="phoneNumber"
                value={newAddress.phoneNumber}
                onChange={handleChange}
                placeholder="0901234567"
                autoComplete="off"
                maxLength={15}
                type="tel"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold">Address Status</Form.Label>
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
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={handleCloseModal}
            style={{ borderRadius: "20px", minWidth: "90px" }}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleSubmitAddress}
            style={{ borderRadius: "20px", minWidth: "90px", fontWeight: "500" }}
          >
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
