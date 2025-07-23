import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Spinner,
  Alert,
  Table,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const orange = "#ff5722";

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user._id;
  const fallbackImg = "../assets/images/no-image.png";
  const navigate = useNavigate();

  const statusList = Array.from(new Set(orders.map((o) => o.Status))).filter(
    Boolean
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/customer/orders/${userId}`
        );
        const data = await res.json();
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

    if (statusFilter) {
      result = result.filter((order) => order.Status === statusFilter);
    }

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((order) => {
        const orderId = (order._id || "").toLowerCase();

        const hasMatch = (order.Items || []).some((item) =>
          (item.Product || []).some(
            (p) =>
              p.ProductName?.toLowerCase().includes(lower) ||
              (p.ProductVariant || []).some((v) =>
                v.ProductVariantName?.toLowerCase().includes(lower)
              )
          )
        );

        return orderId.includes(lower) || hasMatch;
      });
    }

    setFilteredOrders(result);
  }, [search, orders, statusFilter]);

  const handleBuyAgain = (order) => {
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

  const blue = "#1976d2";
  const blueLight = "#e3f2fd";
  const blueBorder = "#bbdefb";
  const blueText = "#1565c0";

  return (
    <Container className="mt-4" style={{ maxWidth: 950 }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 4,
          border: `1px solid ${blueBorder}`,
          padding: "18px 24px 10px 24px",
          marginBottom: 18,
          boxShadow: "0 1px 2px rgba(25, 118, 210, 0.06)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <i className="bi bi-bag" style={{ fontSize: 28, color: blue }} />
        <span style={{ fontSize: 22, fontWeight: 700, color: blueText }}>
          My Orders
        </span>
        <div style={{ flex: 1 }} />
        <InputGroup style={{ maxWidth: 320 }}>
          <Form.Control
            type="text"
            placeholder="Search product, shop, order"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderColor: blueBorder, borderRadius: 20, fontSize: 15 }}
          />
          <InputGroup.Text style={{ background: "#fff", border: "none" }}>
            <i className="bi bi-search" style={{ color: blueText }} />
          </InputGroup.Text>
        </InputGroup>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 4,
          border: `1px solid ${blueBorder}`,
          marginBottom: 18,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 32,
          height: 56,
        }}
      >
        <div
          onClick={() => setStatusFilter("")}
          style={{
            cursor: "pointer",
            color: !statusFilter ? blue : "#555",
            fontWeight: !statusFilter ? 700 : 500,
            borderBottom: !statusFilter
              ? `2.5px solid ${blue}`
              : "2.5px solid transparent",
            padding: "16px 0",
            fontSize: 16,
          }}
        >
          All
        </div>
        {statusList.map((status) => (
          <div
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              cursor: "pointer",
              color: statusFilter === status ? blue : "#555",
              fontWeight: statusFilter === status ? 700 : 500,
              borderBottom:
                statusFilter === status
                  ? `2.5px solid ${blue}`
                  : "2.5px solid transparent",
              padding: "16px 0",
              fontSize: 16,
              textTransform: "capitalize",
            }}
          >
            {status}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 4,
            border: `1px solid ${blueBorder}`,
            padding: "48px 0",
            textAlign: "center",
            color: blueText,
            fontSize: 17,
          }}
        >
          <img
            src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/order/empty-order.png"
            alt="empty"
            style={{
              width: 90,
              marginBottom: 12,
              filter: "hue-rotate(180deg)",
            }}
          />
          <div>No orders yet</div>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order._id}
            style={{
              background: "#fff",
              borderRadius: 4,
              border: `1px solid ${blueBorder}`,
              marginBottom: 18,
              boxShadow: "0 1px 2px rgba(25, 118, 210, 0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: blueLight,
                borderBottom: `1px solid ${blueBorder}`,
                padding: "14px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <i
                  className="bi bi-shop"
                  style={{ color: blue, fontSize: 18 }}
                />
                <span
                  style={{ fontWeight: 600, fontSize: 15, color: blueText }}
                >
                  {order.ShopId?.name || "Shop"}
                </span>
                <Button
                  size="sm"
                  variant="link"
                  style={{
                    color: blue,
                    textDecoration: "none",
                    fontWeight: 600,
                    padding: 0,
                    marginLeft: 8,
                  }}
                  onClick={() => alert(`Contact seller: ${order.ShopId?.name}`)}
                >
                  Contact seller
                </Button>
              </div>
              <span
                style={{
                  color: blue,
                  fontWeight: 700,
                  fontSize: 15,
                  textTransform: "capitalize",
                }}
              >
                {order.Status}
              </span>
            </div>

            {(order.Items || []).flatMap((item) =>
              (item.Product || []).flatMap((product) => {
                if (
                  !product.ProductVariant ||
                  product.ProductVariant.length === 0
                ) {
                  return (
                    <div
                      key={`${item._id}-${product._id}-no-variant`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "18px 24px",
                        borderBottom: `1px solid ${blueBorder}`,
                        gap: 16,
                      }}
                    >
                      <img
                        src={product.ProductImage || fallbackImg}
                        alt=""
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          border: `1px solid ${blueBorder}`,
                          borderRadius: 4,
                          background: blueLight,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: 15,
                            color: blueText,
                          }}
                        >
                          {product.ProductName}
                        </div>
                        <div
                          style={{ color: "#888", fontSize: 13, marginTop: 2 }}
                        >
                          none
                        </div>
                      </div>
                      <div
                        style={{
                          minWidth: 80,
                          textAlign: "center",
                          color: "#555",
                        }}
                      >
                        x{product.Quantity || "N/A"}
                      </div>
                      <div
                        style={{
                          minWidth: 120,
                          textAlign: "right",
                          color: blue,
                          fontWeight: 600,
                        }}
                      >
                        ₫{Number(product.Price || 0).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  );
                }

                return product.ProductVariant.map((variant, i) => (
                  <div
                    key={`${item._id}-${product._id}-${i}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "18px 24px",
                      borderBottom: `1px solid ${blueBorder}`,
                      gap: 16,
                    }}
                  >
                    <img
                      src={product.ProductImage || fallbackImg}
                      alt=""
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        border: `1px solid ${blueBorder}`,
                        borderRadius: 4,
                        background: blueLight,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 15,
                          color: blueText,
                        }}
                      >
                        {product.ProductName}
                      </div>
                      <div
                        style={{ color: "#888", fontSize: 13, marginTop: 2 }}
                      >
                        {variant.ProductVariantName}
                      </div>
                    </div>
                    <div
                      style={{
                        minWidth: 80,
                        textAlign: "center",
                        color: "#555",
                      }}
                    >
                      x{variant.Quantity}
                    </div>
                    <div
                      style={{
                        minWidth: 120,
                        textAlign: "right",
                        color: blue,
                        fontWeight: 600,
                      }}
                    >
                      ₫{Number(variant.Price || 0).toLocaleString("vi-VN")}
                    </div>
                  </div>
                ));
              })
            )}

            <div
              style={{
                background: blueLight,
                padding: "16px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: `1px solid ${blueBorder}`,
              }}
            >
              <div style={{ color: "#888", fontSize: 14 }}>
                <div>
                  <span>Order date: </span>
                  <span style={{ color: blueText }}>
                    {new Date(order.OrderDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span>Address: </span>
                  <span style={{ color: blueText }}>
                    {order.ShippingAddress}
                  </span>
                </div>
                <div>
                  <span>Payment: </span>
                  <span style={{ color: blueText }}>
                    {order.PaymentId || "N/A"}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, color: "#555" }}>
                  Total amount:{" "}
                  <span style={{ color: blue, fontWeight: 700, fontSize: 20 }}>
                    ₫{Number(order.TotalAmount || 0).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    style={{
                      borderColor: blue,
                      color: blueText,
                      fontWeight: 600,
                      borderRadius: 2,
                      minWidth: 120,
                    }}
                    onClick={() =>
                      navigate(
                        `/orderdetail/${order._id}${
                          order.Status === "Đã hủy" ? "?cancelled=true" : ""
                        }`
                      )
                    }
                  >
                    {order.Status === "Đã hủy"
                      ? "Cancellation details"
                      : "View details"}
                  </Button>
                  <Button
                    size="sm"
                    style={{
                      background: blue,
                      borderColor: blue,
                      color: "#fff",
                      fontWeight: 600,
                      borderRadius: 2,
                      minWidth: 120,
                    }}
                    onClick={() => handleBuyAgain(order)}
                  >
                    Buy again
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    style={{
                      borderColor: blue,
                      color: blue,
                      fontWeight: 600,
                      borderRadius: 2,
                      minWidth: 120,
                    }}
                    onClick={() =>
                      alert(`View shop reviews: ${order.ShopId?.name}`)
                    }
                  >
                    Rate shop
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </Container>
  );
};

export default PurchaseOrders;
