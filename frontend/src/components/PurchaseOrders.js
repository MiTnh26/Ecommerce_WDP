import React, { useEffect, useState } from "react";
import { Container, Card, Row, Col, Button, Badge } from "react-bootstrap";

function PurchaseOrders({ userId }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/orders/${userId}`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, [userId]);

  const formatCurrency = (value) => {
    return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
  };

  return (
    <Container className="mt-5">
      <h4 className="mb-4">Purchase Orders</h4>
      {orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        orders.map((order) => (
          <Card className="mb-4 shadow-sm" key={order._id}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Order ID: #{order._id}</span>
              <Badge bg={
                order.status === "Delivered"
                  ? "success"
                  : order.status === "Processing"
                  ? "warning"
                  : "secondary"
              }>
                {order.status}
              </Badge>
            </Card.Header>
            <Card.Body>
              {order.items.map((item, idx) => (
                <Row key={idx} className="align-items-center mb-3">
                  <Col md={2}>
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  </Col>
                  <Col md={6}>
                    <h6>{item.productName}</h6>
                    <p className="mb-0">Quantity: {item.quantity}</p>
                  </Col>
                  <Col md={4} className="text-end">
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </Col>
                </Row>
              ))}
              <hr />
              <div className="d-flex justify-content-end">
                <span className="fw-bold">
                  Total: {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="d-flex justify-content-end mt-2">
                {order.status === "Delivered" && (
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    Rate Product
                  </Button>
                )}
                <Button variant="primary" size="sm">Buy Again</Button>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
}

export default PurchaseOrders;
