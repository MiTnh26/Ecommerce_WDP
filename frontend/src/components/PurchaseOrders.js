import { useEffect, useState } from "react";
import { Container, Card, Spinner, Alert, Table, Form, Button, Row, Col, InputGroup } from "react-bootstrap";

const orange = "#ff5722";

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Thêm state filter

  const userId = "68393a96a8b0479a7a0219a9"; // hard-code for testing

  // Lấy danh sách status duy nhất
  const statusList = Array.from(new Set(orders.map((o) => o.Status))).filter(Boolean);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/customer/orders/${userId}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setOrders(data);
          setFilteredOrders(data);
        } else {
          throw new Error("Unexpected response format");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;

    // Filter theo status
    if (statusFilter) {
      result = result.filter((order) => order.Status === statusFilter);
    }

    // Filter theo search
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((order) => {
        const shopName = order.items[0]?.ProductVariantId?.ProductId?.ShopId?.name?.toLowerCase() || "";
        const orderId = (order._id || "").toLowerCase();
        const hasProduct = (order.items || []).some(
          (item) =>
            item.ProductVariantId?.productName?.toLowerCase().includes(lower)
        );
        return (
          shopName.includes(lower) ||
          orderId.includes(lower) ||
          hasProduct
        );
      });
    }

    setFilteredOrders(result);
  }, [search, orders, statusFilter]);

  const handleBuyAgain = (order) => {
    // Implement buy again logic here
    alert("Buy again clicked for order " + order._id);
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" style={{ color: orange }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h4 className="mb-4" style={{ color: orange, fontWeight: 700 }}>
        Your Orders
      </h4>
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by shop name, order ID or product name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ borderColor: orange }}
            />
            <InputGroup.Text style={{ background: orange, color: "#fff" }}>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
          </InputGroup>
        </Col>
        <Col md={4} lg={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ borderColor: orange }}
          >
            <option value="">All Status</option>
            {statusList.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      {filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        filteredOrders.map((order) => (
          <Card
            className="mb-4"
            key={order._id}
            style={{
              borderColor: orange,
              boxShadow: "0 2px 8px rgba(255,87,34,0.08)",
            }}
          >
            <Card.Header
              style={{
                background: orange,
                color: "#fff",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                <strong>Shop:</strong>{" "}
                {order.items[0]?.ProductVariantId?.ProductId?.ShopId?.name || "Unknown"}
              </span>
              <span>
                <strong>Order ID:</strong> {order._id}
              </span>
            </Card.Header>
            <Card.Body>
              <Table bordered>
                <tbody>
                  <tr>
                    <td style={{ width: 180 }}><strong>Order Date</strong></td>
                    <td>{new Date(order.OrderDate).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td><strong>Status</strong></td>
                    <td>{order.Status}</td>
                  </tr>
                  <tr>
                    <td><strong>Shipping Address</strong></td>
                    <td>{order.ShippingAddress}</td>
                  </tr>
                  <tr>
                    <td><strong>Total Amount</strong></td>
                    <td>
                      ${parseFloat(order.TotalAmount?.$numberDecimal || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Payment ID</strong></td>
                    <td>{order.PaymentId || "N/A"}</td>
                  </tr>
                </tbody>
              </Table>

              <h6 className="mt-4" style={{ color: orange, fontWeight: 600 }}>Items:</h6>
              <Table striped bordered>
                <thead style={{ background: "#fff3e0" }}>
                  <tr>
                    <th>Product Name</th>
                    <th>Variant</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item) => (
                    <tr key={item._id}>
                      <td>{item.ProductVariantId?.productName || "Unknown"}</td>
                      <td>{item.ProductVariantId?.ProductVariantName || "Unknown"}</td>
                      <td>{item.Quantity}</td>
                      <td>${Number(item.Price || 0).toFixed(2)}</td>
                      <td>{item.Status}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-end">
                <Button
                  style={{
                    background: orange,
                    borderColor: orange,
                    fontWeight: 600,
                  }}
                  onClick={() => handleBuyAgain(order)}
                >
                  Buy Again
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default PurchaseOrders;
