import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ViewOrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  console.log(order);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/seller/orders/${orderId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load order information");
      }

      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/seller/orders/${orderId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Status: newStatus }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setOrder({ ...order, Status: newStatus });
        setShowSuccessModal(true);
        // Modal sẽ tự đóng và chuyển trang sau 1.5 giây
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate("../viewlistorder");
        }, 1500);
      } else {
        throw new Error(data.message || "Unable to update status");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBackToList = () => {
    navigate("../viewlistorder");
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!order) return null;

  return (
    <>
      <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa" }}>
        <Row>
          <Col>
            <div className="bg-white rounded p-4 shadow-sm">
              <h2 className="text-center mb-4" style={{ fontWeight: "600" }}>
                Order Details
              </h2>

              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Order Information</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <FormField label="Order ID" value={order._id} />
                      <FormField
                        label="Order Date"
                        value={new Date(order.OrderDate).toLocaleString()}
                      />
                      <FormField label="Status" value={order.Status} />
                      <FormField
                        label="Total Amount"
                        value={`$${Number(order.TotalAmount).toLocaleString(
                          "vi-VN"
                        )}`}
                      />
                    </Col>
                    <Col md={6}>
                      <FormField
                        label="Receiver Name"
                        value={order.ReceiverName}
                      />
                      <FormField
                        label="Phone Number"
                        value={order.ReceiverPhone}
                      />
                      <FormField
                        label="Shipping Address"
                        value={order.ShippingAddress}
                        textarea
                      />
                      <FormField
                        label="Payment Method"
                        value={order.PaymentId}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Product Details</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive>
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Variant</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.Items.map((product, idx) => (
                        <tr key={product._id}>
                          <td>
                            <img
                              src={product.ProductImage || "/assets/images/no-image.png"}
                              alt={product.ProductName}
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                                border: "1px solid #dee2e6",
                                borderRadius: "8px",
                              }}
                            />
                          </td>
                          <td className="align-middle">{product.ProductName}</td>
                          <td className="align-middle">
                            {product.ProductVariant.map(variant => (
                              <div key={variant._id}>{variant.ProductVariantName}</div>
                            ))}
                          </td>
                          <td className="align-middle">
                            {product.ProductVariant.map(variant => (
                              <div key={variant._id}>${Number(variant.Price).toLocaleString('vi-VN')}</div>
                            ))}
                          </td>
                          <td className="align-middle">
                            {product.ProductVariant.map(variant => (
                              <div key={variant._id}>{variant.Quantity}</div>
                            ))}
                          </td>
                          <td className="align-middle">
                            {product.ProductVariant.map(variant => (
                              <div key={variant._id}>${Number(variant.Price * variant.Quantity).toLocaleString('vi-VN')}</div>
                            ))}
                          </td>
                        </tr>
                      ))}

                    </tbody>

                  </Table>
                </Card.Body>
              </Card>

              <div className="text-center">
                <Button
                  variant="success"
                  className="me-3"
                  onClick={() => handleStatusChange("Delivered")}
                  style={{ minWidth: "120px" }}
                  disabled={order.Status === "Delivered"}
                >
                  Mark as Delivered
                </Button>

                <Button
                  variant="secondary"
                  onClick={handleBackToList}
                  style={{ minWidth: "120px" }}
                >
                  Back to List
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showSuccessModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <i
              className="fas fa-check-circle text-success"
              style={{ fontSize: "3rem" }}
            ></i>
          </div>
          <h5>Order status updated to Delivered successfully!</h5>
        </Modal.Body>
      </Modal>
    </>
  );
};

const FormField = ({ label, value, textarea = false }) => (
  <div className="mb-3">
    <label>
      <strong>{label}</strong>
    </label>
    {textarea ? (
      <textarea
        className="form-control"
        value={value}
        readOnly
        style={{ backgroundColor: "#f8f9fa" }}
        rows={4}
      />
    ) : (
      <input
        type="text"
        className="form-control"
        value={value}
        readOnly
        style={{ backgroundColor: "#f8f9fa" }}
      />
    )}
  </div>
);

export default ViewOrderDetail;
