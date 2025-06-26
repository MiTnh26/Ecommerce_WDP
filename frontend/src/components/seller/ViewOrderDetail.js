import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Dùng thay cho next/navigation
import "bootstrap/dist/css/bootstrap.min.css";

const ViewOrderDetail = () => {
  const navigate = useNavigate(); // Sử dụng để điều hướng

  const [productData, setProductData] = useState({
    _id: 1,
    name: "Áo Phao Béo",
    category: "Áo",
    description: "Áo khoác phao mùa đông very beautiful",
    status: "Pending",
    images: ["/placeholder.svg?height=200&width=200"],
  });

  const [variants] = useState([
    {
      _id: 1,
      image: "/placeholder.svg?height=100&width=100",
      name: "Áo Phao Nâu",
      price: 30000.0,
      stockQuantity: 30,
    },
  ]);

  const handleStatusChange = (status) => {
    setProductData({ ...productData, status });
  };

  const handleBackToList = () => {
    navigate("/viewlistorder");
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa" }}>
      <Row>
        <Col>
          <div className="bg-white rounded p-4 shadow-sm">
            <h2 className="text-center mb-4" style={{ fontWeight: "600" }}>
              View Order Detail
            </h2>

            <Row>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Product Images</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-center">
                      <img
                        src={productData.images[0] || "/placeholder.svg"}
                        alt="Product"
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                          border: "1px solid #dee2e6",
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <div className="mb-4">
                  <FormField label="Product Name" value={productData.name} />
                  <FormField label="Category" value={productData.category} />
                  <FormField label="Description" value={productData.description} textarea />
                  <FormField label="Status" value={productData.status} />
                </div>
              </Col>
            </Row>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Product Variants</h5>
              </Card.Header>
              <Card.Body>
                <Table responsive>
                  <thead style={{ backgroundColor: "#f8f9fa" }}>
                    <tr>
                      <th>Variant Image</th>
                      <th>Variant Name</th>
                      <th>Price</th>
                      <th>Stock Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant._id}>
                        <td>
                          <img
                            src={variant.image || "/placeholder.svg"}
                            alt={variant.name}
                            style={{
                              width: "80px",
                              height: "80px",
                              objectFit: "cover",
                              border: "1px solid #dee2e6",
                              borderRadius: "8px",
                            }}
                          />
                        </td>
                        <td className="align-middle">{variant.name}</td>
                        <td className="align-middle">{variant.price}</td>
                        <td className="align-middle">{variant.stockQuantity}</td>
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
              >
                Delivered
              </Button>
              <Button
                variant="danger"
                className="me-3"
                onClick={() => handleStatusChange("Cancelled")}
                style={{ minWidth: "120px" }}
              >
                Cancelled
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
