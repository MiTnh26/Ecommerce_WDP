// ✅ Shopee-style Address Form integrated with main AddressForm
import React, { useEffect, useState } from "react";
import { BsPencil, BsTrash, BsStar } from "react-icons/bs";
import PropTypes from "prop-types";
import {
  Card,
  Container,
  Image,
  Modal,
  Button,
  Form,
  ListGroup,
  Badge,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import "../style/customer/AddressForm.css";

function AddressForm({ userId,user: userProp }) {
   const [user, setUser] = useState(userProp || null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [formData, setFormData] = useState({
    receiverName: "",
    phoneNumber: "",
    province: "",
    district: "",
    ward: "",
    detail: "",
    status: "Inactive"
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [errors, setErrors] = useState({});
   useEffect(() => {
    if (userProp) setUser(userProp);
  }, [userProp]);
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5000/customer/profile/${userId}`)
      .then(res => res.json())
      .then(setUser)
      .catch(err => alert("Unable to load user data"));
  }, [userId]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then(setProvinces);
  }, []);

  const handleProvinceChange = async (e) => {
    const name = e.target.value;
    const selected = provinces.find(p => p.name === name);
    setFormData(prev => ({
      ...prev,
      province: selected?.name || "",
      district: "",
      ward: "",
    }));

    if (!selected) return;
    const res = await fetch(`https://provinces.open-api.vn/api/p/${selected.code}?depth=2`);
    const data = await res.json();
    setDistricts(data.districts || []);
    setWards([]);
  };

  const handleDistrictChange = async (e) => {
    const name = e.target.value;
    const selected = districts.find(d => d.name === name);
    setFormData(prev => ({
      ...prev,
      district: selected?.name || "",
      ward: ""
    }));

    if (!selected) return;
    const res = await fetch(`https://provinces.open-api.vn/api/d/${selected.code}?depth=2`);
    const data = await res.json();
    setWards(data.wards || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ward") {
      const selected = wards.find(w => w.name === value);
      setFormData(prev => ({
        ...prev,
        ward: selected?.name || ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.receiverName.trim()) newErrors.receiverName = "Receiver name is required";
    if (!formData.phoneNumber.match(/^\d{10,11}$/)) newErrors.phoneNumber = "Invalid phone number";
    if (!formData.province) newErrors.province = "Please select a province";
    if (!formData.district) newErrors.district = "Please select a district";
    if (!formData.ward) newErrors.ward = "Please select a ward";
    if (!formData.detail.trim()) newErrors.detail = "Detailed address is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    const payload = {
      receiverName: formData.receiverName,
      phoneNumber: formData.phoneNumber,
      province: formData.province,
      district: formData.district,
      ward: formData.ward,
      detail: formData.detail,
      status: formData.status || "Inactive",
    };

    const url = isEditing
      ? `http://localhost:5000/customer/user/${userId}/address/${editingAddressId}`
      : `http://localhost:5000/customer/user/${userId}/address`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit address");

      const updatedUser = await (await fetch(`http://localhost:5000/customer/profile/${userId}`)).json();
      setUser(updatedUser);
      setShowModal(false);
      setIsEditing(false);
      setEditingAddressId(null);
      setFormData({ receiverName: "", phoneNumber: "", province: "", district: "", ward: "", detail: "", status: "Inactive" });
      alert(isEditing ? "Address updated successfully" : "Address added successfully");
    } catch (err) {
      alert("Failed to submit address");
    }
  };

  const handleEdit = async (addr) => {
    setIsEditing(true);
    setEditingAddressId(addr._id);

    let phone = addr.phoneNumber?.toString() || "";

    if (!addr.province) {
      setFormData({
        receiverName: addr.receiverName,
        phoneNumber: phone,
        detail: addr.detail || "",
        province: "",
        district: "",
        ward: "",
        status: addr.status || "Inactive",
      });
      setDistricts([]);
      setWards([]);
      setErrors({});
      setShowModal(true);
      return;
    }

    try {
      const provinceObj = provinces.find(p => p.name === addr.province);
      if (!provinceObj) throw new Error("Province not found");

      const resP = await fetch(`https://provinces.open-api.vn/api/p/${provinceObj.code}?depth=2`);
      const dataP = await resP.json();
      const fetchedDistricts = dataP.districts || [];
      setDistricts(fetchedDistricts);

      const districtObj = fetchedDistricts.find(d => d.name === addr.district);
      let wardsList = [];
      if (districtObj) {
        const resD = await fetch(`https://provinces.open-api.vn/api/d/${districtObj.code}?depth=2`);
        const dataD = await resD.json();
        wardsList = dataD.wards || [];
      }
      setWards(wardsList);

      setTimeout(() => {
        setFormData({
          receiverName: addr.receiverName,
          phoneNumber: phone,
          detail: addr.detail || "",
          province: addr.province || "",
          district: addr.district || "",
          ward: addr.ward || "",
          status: addr.status || "Inactive",
        });
        setShowModal(true);
      }, 0);
    } catch (error) {
      console.error(error);
      setDistricts([]);
      setWards([]);
      setFormData({
        receiverName: addr.receiverName,
        phoneNumber: phone,
        detail: addr.detail || "",
        province: addr.province || "",
        district: addr.district || "",
        ward: addr.ward || "",
        status: addr.status || "Inactive",
      });
      setShowModal(true);
    }
  };

  const handleDelete = async (id) => {
    const target = user.ShippingAddress.find(a => a._id === id);
    if (target?.status === "Default") return alert("Cannot delete default address");
    if (!window.confirm("Confirm delete address?")) return;

    await fetch(`http://localhost:5000/customer/user/${userId}/address/${id}`, { method: "DELETE" });
    const updatedUser = await (await fetch(`http://localhost:5000/customer/profile/${userId}`)).json();
    setUser(updatedUser);
  };

  const handleSetDefault = async (id) => {
    await fetch(`http://localhost:5000/customer/user/${userId}/address/${id}/set-default`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Default" })
    });
    const updatedUser = await (await fetch(`http://localhost:5000/customer/profile/${userId}`)).json();
    setUser(updatedUser);
  };

  useEffect(() => {
    if (showModal) {
      setErrors({});
    }
  }, [showModal]);

  if (!user) return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card className="w-100 shadow-lg" style={{ maxWidth: 650 }}>
        <Card.Header className="bg-primary text-white py-4">
          <div className="d-flex align-items-center">
            <Image src={user.Image || "/default-avatar.png"} roundedCircle width={64} height={64} className="me-3" />
            <div>
              <h5 className="mb-1">{user.FirstName} {user.LastName}</h5>
              <small>{user.Email}</small>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Shipping Addresses</h5>
            <Button onClick={() => {
              setErrors({});
              setFormData({ receiverName: "", phoneNumber: "", province: "", district: "", ward: "", detail: "", status: "Inactive" });
              setIsEditing(false);
              setShowModal(true);
            }}>+ Add Address</Button>
          </div>
          <ListGroup>
            {user.ShippingAddress?.map(addr => (
              <ListGroup.Item key={addr._id} className="mb-2">
                <div className="d-flex flex-column flex-md-row justify-content-between">
                  <div className="mb-2 mb-md-0" style={{ maxWidth: '70%' }}>
                    <strong>{addr.receiverName}</strong>
                    <div className="text-break">
                      {[addr.detail, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                    </div>
                    <div>{addr.phoneNumber}</div>
                    {addr.status === "Default" && <Badge bg="primary">Default</Badge>}
                  </div>

                  <div className="text-end d-flex flex-wrap gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => handleEdit(addr)}>
                      <BsPencil />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      disabled={addr.status === "Default"}
                      onClick={() => handleDelete(addr._id)}
                    >
                      <BsTrash />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-success"
                      disabled={addr.status === "Default"}
                      onClick={() => handleSetDefault(addr._id)}
                    >
                      <BsStar />
                    </Button>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? "Update Address" : "Add New Address"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Receiver Name</Form.Label>
              <Form.Control name="receiverName" value={formData.receiverName} onChange={handleChange} isInvalid={!!errors.receiverName} />
              <Form.Control.Feedback type="invalid">{errors.receiverName}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} isInvalid={!!errors.phoneNumber} />
              <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
            </Form.Group>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Province</Form.Label>
                  <Form.Select name="province" value={formData.province} onChange={handleProvinceChange} isInvalid={!!errors.province}>
                    <option value="">Select</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.name}>{p.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.province}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label>District</Form.Label>
                  <Form.Select name="district" value={formData.district} onChange={handleDistrictChange} isInvalid={!!errors.district}>
                    <option value="">Select</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.district}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-2">
                  <Form.Label>Ward</Form.Label>
                  <Form.Select name="ward" value={formData.ward} onChange={handleChange} isInvalid={!!errors.ward}>
                    <option value="">Select</option>
                    {wards.map(w => (
                      <option key={w.code} value={w.name}>{w.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.ward}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-2">
              <Form.Label>Detailed Address</Form.Label>
              <Form.Control name="detail" value={formData.detail} onChange={handleChange} isInvalid={!!errors.detail} />
              <Form.Control.Feedback type="invalid">{errors.detail}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value="Inactive">Not Default</option>
                <option value="Default">Default</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="success" onClick={handleSubmit}>{isEditing ? "Update" : "Save"}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

AddressForm.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default AddressForm;
