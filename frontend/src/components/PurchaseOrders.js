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
import '../style/customer/PurchaseOrders.css';

const PurchaseOrders = ({ userId, setActiveTab, setSelectedOrderId }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
   const [message, setMessage] = useState(null);
  // const user = JSON.parse(localStorage.getItem("user"));
  // const userId = user._id;
  const fallbackImg = "../assets/images/no-image.png";
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) navigate("/login");
  }, []);

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
    let result = [...orders];

    if (statusFilter) {
      result = result.filter((order) => order.Status === statusFilter);
    }

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((order) => {
        const orderId = (order._id || "").toLowerCase();
        const hasMatch = (order.Items || []).some((item) => {
          return (item.Product || []).some((p) => {
            const productMatch = p.ProductName?.toLowerCase().includes(lower);
            const variantMatch = (p.ProductVariant || []).some((v) =>
              v.ProductVariantName?.toLowerCase().includes(lower)
            );
            return productMatch || variantMatch;
          });
        });

        return (
          orderId.includes(lower) ||
          (order.ShopId?.name || "").toLowerCase().includes(lower) ||
          (order.ShippingAddress || "").toLowerCase().includes(lower) ||
          (order.PaymentMethod || "").toLowerCase().includes(lower) ||
          (order.Status || "").toLowerCase().includes(lower) ||
          hasMatch
        );
      });
    }

    setFilteredOrders(result);
  }, [search, orders, statusFilter]);

   const handleBuyAgain = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/customer/buy-again/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ UserId: userId }),
      });
      const data = await res.json();
      
      if (res.ok) {
         navigate('/Ecommerce/user/cart');
        setMessage({ type: "success", text: "Đã thêm lại sản phẩm vào giỏ hàng." });
      } else {
        throw new Error(data.message || "Mua lại thất bại");
      }
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    }
  };
  const handleCancelOrder = (order) => {
    const orderId = order._id;

    fetch(`http://localhost:5000/customer/orders/cancel/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, Status: "Cancelled" } : o
          )
        );
      })
      .catch((error) => {
        console.error("Lỗi khi huỷ đơn:", error);
      });
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" className="purchaseorders-spinner" />
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
    <Container className="purchaseorders-container">
      <div className="purchaseorders-header">
        <i className="bi bi-bag purchaseorders-header-icon" />
        <span className="purchaseorders-header-title">
          My Orders
        </span>
        <div className="purchaseorders-header-spacer" />
        <InputGroup className="purchaseorders-search-group">
          <Form.Control
            type="text"
            placeholder="Search product, variant, shop, status"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="purchaseorders-search-input"
          />
          <InputGroup.Text className="purchaseorders-search-icon">
            <i className="bi bi-search" />
          </InputGroup.Text>
        </InputGroup>
      </div>

      <div className="purchaseorders-tabs">
        <div
          className={`order-tab ${!statusFilter ? "active" : ""}`}
          onClick={() => setStatusFilter("")}
        >
          All
        </div>
        {statusList.map((status) => (
          <div
            key={status}
            className={`order-tab ${statusFilter === status ? "active" : ""}`}
            onClick={() => setStatusFilter(status)}
            style={{ textTransform: "capitalize" }}
          >
            {status}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="purchaseorders-empty">
          <img
            src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/order/empty-order.png"
            alt="empty"
            className="purchaseorders-empty-img"
          />
          <div>No orders yet</div>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order._id}
            className="purchaseorders-order-card"
          >
            <div className="purchaseorders-order-header">
              <div className="purchaseorders-order-shop">
                <i className="bi bi-shop purchaseorders-order-shop-icon" />
                <span className="purchaseorders-order-shop-name">
                  {order.ShopId?.name || "Shop"}
                </span>
                {/* <Button
                  size="sm"
                  variant="link"
                  className="purchaseorders-contact-seller-btn"
                  onClick={() => alert(`Contact seller: ${order.ShopId?.name}`)}
                >
                  Contact seller
                </Button> */}
              </div>
              <span className="purchaseorders-order-status">
                {order.Status}
              </span>
            </div>

            {Array.isArray(order.Items) ? order.Items.flatMap((item) => {
              return (item.Product || []).flatMap((product) => {
                if (!product.ProductVariant || product.ProductVariant.length === 0) {
                  return (
                    <div
                      className="order-item-row"
                      key={`${item._id}-${product._id}-no-variant`}
                    >
                      <img
                        src={product.ProductImage || fallbackImg}
                        alt=""
                        className="order-item-img"
                      />
                      <div className="order-item-info">
                        <div className="order-item-name">
                          {product.ProductName}
                        </div>
                        <div className="order-item-variant">
                          none
                        </div>
                      </div>
                      <div className="order-item-qty">
                        x{product.Quantity || "N/A"}
                      </div>
                      <div className="order-item-price">
                        ${Number(product.Price || 0).toLocaleString("vi-VN")}
                      </div>
                    </div>
                  );
                }

                return product.ProductVariant.map((variant, i) => (
                  <div
                    className="order-item-row"
                    key={`${item._id}-${product._id}-${i}`}
                  >
                    {/* <img
                      src={product.ProductImage || fallbackImg}
                      alt=""
                      className="order-item-img"
                    /> */}
                    <img
                      src={variant.Image || fallbackImg}
                      alt=""
                      className="order-item-img"
                    />
                    <div className="order-item-info">
                      <div className="order-item-name">
                        {product.ProductName}
                      </div>
                      <div className="order-item-variant">
                        {variant.ProductVariantName}
                      </div>
                    </div>
                    <div className="order-item-qty">
                      x{variant.Quantity}
                    </div>
                    <div className="order-item-price">
                      ${Number(variant.Price || 0).toLocaleString("vi-VN")}
                    </div>
                  </div>
                ));
              })
            })
              : null}

            <div className="purchaseorders-order-footer">
              <div className="purchaseorders-order-footer-info">
                <div>
                  <span>Order date: </span>
                  <span className="purchaseorders-order-footer-highlight">
                    {new Date(order.OrderDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span>Address: </span>
                  <span className="purchaseorders-order-footer-highlight">
                    {order.ShippingAddress}
                  </span>
                </div>
                <div>
                  <span>Payment: </span>
                  <span className="purchaseorders-order-footer-highlight">
                    {order.PaymentId?.Name || "unknow"}
                  </span>
                </div>
              </div>
              <div className="purchaseorders-order-footer-actions">
                <div className="purchaseorders-order-footer-total">
                  Total amount:{" "}
                  <span className="purchaseorders-order-footer-total-value">
                    ${Number(order.TotalAmount || 0).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="purchaseorders-order-footer-btns">
                  <Button

                    size="sm"
                    style={{
                      background: "linear-gradient(90deg, #ff7a00 0%, #ffae42 100%)",
                      color: "white",
                      border: "none",
                      padding: "0.4rem 1rem",
                      borderRadius: "8px",
                      fontWeight: 500,
                      boxShadow: "0 4px 12px rgba(255, 122, 0, 0.3)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    className="purchaseorders-detail-btn"
                    onClick={() => {
                      setSelectedOrderId(order._id)
                      setActiveTab("orderdetail");


                    }}
                  >
                    {order.Status === "Cancelled" ? "Cancellation details" : "View details"}
                  </Button>
                  {["Delivered", "Cancelled"].includes(order.Status) && (
                    <Button
                      size="sm"
                      style={{
                        background: "linear-gradient(90deg, #a259ff 0%, #c084fc 100%)",
                        color: "white",
                        border: "none",
                        padding: "0.4rem 1rem",
                        borderRadius: "8px",
                        fontWeight: 500,
                        boxShadow: "0 4px 12px rgba(162, 89, 255, 0.3)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => handleBuyAgain(order._id)}
                    >
                      Buy again
                    </Button>


                  )}
                  {["Pending"].includes(order.Status) && (
                    <Button
                      size="sm"
                      style={{
                        background: "linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%)",
                        color: "white",
                        border: "none",
                        padding: "0.4rem 1rem",
                        borderRadius: "8px",
                        fontWeight: 500,
                        boxShadow: "0 4px 12px rgba(255, 77, 79, 0.3)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (window.confirm("Bạn chắc chắn muốn huỷ đơn hàng này?")) {
                          handleCancelOrder(order);
                        }
                      }}
                    >
                      Cancel Order
                    </Button>


                  )}
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
