import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  Form,
  Button,
  Table,
  Pagination,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ViewListOrder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("new-old");

  const [orders] = useState([
    {
      _id: 1,
      customerName: "Đỗ Anh",
      productName: "Áo Phao Béo",
      variant: "Áo Phao Nâu",
      quantity: 1,
      dateAdd: "2025-06-22",
      status: "Pending",
    },
  ]);

  const handleTabSelect = (tab) => setActiveTab(tab);
  const handleSearch = () => console.log("Searching for:", searchTerm);
  const handleSortChange = (order) => setSortOrder(order);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.variant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "All" || order.status.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.dateAdd);
    const dateB = new Date(b.dateAdd);
    return sortOrder === "new-old" ? dateB - dateA : dateA - dateB;
  });

  return (
    <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa" }}>
      <Row>
        <Col>
          <div className="bg-white rounded p-4 shadow-sm">
            <h2 className="text-center mb-4" style={{ fontWeight: "600" }}>
              View List Order
            </h2>

            {/* Tabs */}
            <Nav variant="pills" className="mb-4">
              {["All", "Pending", "Delivered", "Cancelled"].map((status) => (
                <Nav.Item key={status}>
                  <Nav.Link
                    active={activeTab === status}
                    onClick={() => handleTabSelect(status)}
                    className="me-2"
                    style={{
                      backgroundColor: activeTab === status ? "#6c757d" : "transparent",
                      color: activeTab === status ? "white" : "#6c757d",
                      border: "none",
                    }}
                  >
                    {status}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>

            {/* Search + Sort */}
            <Row className="mb-4 align-items-center">
              <Col md={6}>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="me-2"
                    style={{ backgroundColor: "#f8f9fa" }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleSearch}
                    style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6" }}
                  >
                    Search
                  </Button>
                </div>
              </Col>
              <Col md={6} className="text-end">
                <Button
                  variant={sortOrder === "new-old" ? "outline-dark" : "outline-secondary"}
                  className="me-2"
                  onClick={() => handleSortChange("new-old")}
                  size="sm"
                >
                  📊 New → Old
                </Button>
                <Button
                  variant={sortOrder === "old-new" ? "warning" : "outline-warning"}
                  onClick={() => handleSortChange("old-new")}
                  size="sm"
                  style={{
                    backgroundColor: sortOrder === "old-new" ? "#ffc107" : "transparent",
                    borderColor: "#ffc107",
                  }}
                >
                  📊 Old → New
                </Button>
              </Col>
            </Row>

            {/* Table */}
            <Table responsive className="mb-4">
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th>No.</th>
                  <th>Customer Name</th>
                  <th>Product Name</th>
                  <th>Variant</th>
                  <th>Quantity</th>
                  <th>Date Added</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order, index) => (
                  <tr key={order._id}>
                    <td>{index + 1}</td>
                    <td>{order.customerName}</td>
                    <td>{order.productName}</td>
                    <td>{order.variant}</td>
                    <td>{order.quantity}</td>
                    <td>{order.dateAdd}</td>
                    <td>{order.status}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => navigate(`/order/${order._id}`)}
                        style={{
                          backgroundColor: "#ffc107",
                          borderColor: "#ffc107",
                          color: "#000",
                        }}
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination Placeholder */}
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.Item active>{1}</Pagination.Item>
              </Pagination>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewListOrder;
