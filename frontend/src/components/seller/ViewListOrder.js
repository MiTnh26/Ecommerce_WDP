import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Nav,
  Form,
  Button,
  Table,
  Pagination,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const ViewListOrder = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("new-old");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shopId, setShopId] = useState(localStorage.getItem("shopId"));

  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // First fetch the shop information if shopId is not available
  useEffect(() => {
    const fetchShopInfo = async () => {
      if (!shopId && user && user._id) {
        try {
          const res = await axios.get(
            `http://localhost:5000/seller/getShopInformation?owner=${user._id}`
          );

          if (res.data && res.data._id) {
            console.log("Fetched shop ID:", res.data._id);
            localStorage.setItem("shopId", res.data._id);
            setShopId(res.data._id);
          }
        } catch (err) {
          console.error("Error fetching shop information:", err);
          setError("Failed to fetch shop information. Please try again.");
        }
      }
    };

    fetchShopInfo();
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!shopId) return;

      setLoading(true);
      try {
        // Check if shopId is valid before making request
        if (typeof shopId !== "string" || shopId.length !== 24) {
          setError(
            "Invalid shop ID. Please make sure you're logged in as a seller and have registered a shop."
          );
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/seller/orders?shopId=${shopId}`
        );
        setOrders(res.data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchOrders();
    }
  }, [shopId]);

  const handleTabSelect = (tab) => setActiveTab(tab);
  const handleSearch = () => {};
  const handleSortChange = (order) => setSortOrder(order);

  const filteredOrders = orders.filter((order) => {
    try {
      const matchesSearch =
        (order.customerName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (order.productName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (order.variant?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === "All" ||
        (order.status?.toLowerCase() || "") === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
    } catch (err) {
      console.error("Error filtering order:", err);
      return false;
    }
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    try {
      const dateA = new Date(a.dateAdd || 0);
      const dateB = new Date(b.dateAdd || 0);
      return sortOrder === "new-old" ? dateB - dateA : dateA - dateB;
    } catch (err) {
      return 0;
    }
  });

  // If we're still loading the shop information, show a loading message
  if (loading && !shopId) {
    return (
      <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa" }}>
        <Row>
          <Col>
            <div className="bg-white rounded p-4 shadow-sm text-center">
              <h2 className="mb-4" style={{ fontWeight: "600" }}>
                View List Order
              </h2>
              <p>Loading shop information...</p>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  // If we have an error or couldn't find a shop, show a message
  if (error && !shopId) {
    return (
      <Container fluid className="py-4" style={{ backgroundColor: "#f8f9fa" }}>
        <Row>
          <Col>
            <div className="bg-white rounded p-4 shadow-sm">
              <h2 className="text-center mb-4" style={{ fontWeight: "600" }}>
                View List Order
              </h2>
              <Alert variant="warning">
                <h4>Shop Access Issue</h4>
                <p>{error}</p>
                <div className="mt-3">
                  <Button
                    variant="primary"
                    onClick={() => navigate("/Ecommerce/seller/shop-profile")}
                  >
                    Go to Shop Profile
                  </Button>
                </div>
              </Alert>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

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
              {["All", "Pending", "Delivered"].map((status) => (
                <Nav.Item key={status}>
                  <Nav.Link
                    active={activeTab === status}
                    onClick={() => handleTabSelect(status)}
                    className="me-2"
                    style={{
                      backgroundColor:
                        activeTab === status ? "#6c757d" : "transparent",
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
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderColor: "#dee2e6",
                    }}
                  >
                    Search
                  </Button>
                </div>
              </Col>
              <Col md={6} className="text-end">
                <Button
                  variant={
                    sortOrder === "new-old"
                      ? "outline-dark"
                      : "outline-secondary"
                  }
                  className="me-2"
                  onClick={() => handleSortChange("new-old")}
                  size="sm"
                >
                  📊 New → Old
                </Button>
                <Button
                  variant={
                    sortOrder === "old-new" ? "warning" : "outline-warning"
                  }
                  onClick={() => handleSortChange("old-new")}
                  size="sm"
                  style={{
                    backgroundColor:
                      sortOrder === "old-new" ? "#ffc107" : "transparent",
                    borderColor: "#ffc107",
                  }}
                >
                  📊 Old → New
                </Button>
              </Col>
            </Row>

            {/* Table */}
            {loading ? (
              <div className="text-center py-5">
                <span>Loading...</span>
              </div>
            ) : error ? (
              <div className="text-danger text-center py-5">{error}</div>
            ) : sortedOrders.length === 0 ? (
              <div className="text-center py-5">
                <p>No orders found</p>
              </div>
            ) : (
              <Table responsive className="mb-4">
                <thead style={{ backgroundColor: "#f8f9fa" }}>
                  <tr>
                    <th>No.</th>
                    <th>Customer Name</th>
                    <th>Total Money</th>
                    <th>Date Added</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((order, index) => (
                    <tr key={order._id}>
                      <td>{index + 1}</td>
                      <td>{order.customerName || "N/A"}</td>
                      <td>{order.totalAmount || "N/A"}</td>
                     
                      <td>
                        {order.dateAdd
                          ? new Date(order.dateAdd).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>{order.status || "N/A"}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => navigate(`/Ecommerce/seller/vieworderdetail/${order._id}`)}
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
            )}

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
