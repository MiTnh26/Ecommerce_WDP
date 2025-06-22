import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert, Button } from "react-bootstrap";

const orange = "#ee4d2d";
const fallbackImg = "../assets/images/no-image.png";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5000/customer/orderdetail/${orderId}`);
        const data = await res.json();
        if (data && data._id) setOrder(data);
        else throw new Error("Không tìm thấy đơn hàng");
      } catch (err) {
        setError(err.message || "Lỗi khi tải đơn hàng");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

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

  if (!order) return null;

  const blue = "#007bff";

  return (
    <Container className="mt-4" style={{ maxWidth: 900 }}>
  
      <div
        style={{
          background: "#fff",
          borderRadius: 4,
          border: "1px solid #f5f5f5",
          padding: "18px 24px 10px 24px",
          marginBottom: 18,
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <i className="bi bi-receipt" style={{ fontSize: 28, color: blue }} />
        <span style={{ fontSize: 22, fontWeight: 700, color: "#222" }}>Chi tiết đơn hàng</span>
        <div style={{ flex: 1 }} />
        <Button variant="outline-primary" size="sm" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>

    
      <div
        style={{
          background: "#fff",
          borderRadius: 4,
          border: "1px solid #f5f5f5",
          marginBottom: 18,
          padding: "18px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>
              Mã đơn hàng: <span style={{ color: blue }}>{order._id}</span>
            </div>
            <div style={{ color: "#888", fontSize: 14 }}>
              Ngày đặt: {new Date(order.OrderDate).toLocaleString()}
            </div>
          </div>
          <div>
            <span
              style={{
                color: blue,
                fontWeight: 700,
                fontSize: 16,
                textTransform: "capitalize",
              }}
            >
              {order.Status}
            </span>
          </div>
        </div>
        <div style={{ color: "#555", fontSize: 15 }}>
          <div>
            <b>Người nhận:</b> {order.ReceiverName || "N/A"}
          </div>
          <div>
            <b>SĐT:</b> {order.ReceiverPhone || "N/A"}
          </div>
          <div>
            <b>Địa chỉ giao hàng:</b> {order.ShippingAddress}
          </div>
          <div>
            <b>Phương thức thanh toán:</b> {order.PaymentId || "N/A"}
          </div>
        </div>
      </div>


      <div
        style={{
          background: "#fff",
          borderRadius: 4,
          border: "1px solid #f5f5f5",
          marginBottom: 18,
          overflow: "hidden",
        }}
      >
        {(order.Items || []).flatMap((item) =>
          (item.Product || []).flatMap((product) => {
            if (!product.ProductVariant || product.ProductVariant.length === 0) {
              return (
                <div
                  key={`${item._id}-${product._id}-no-variant`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "18px 24px",
                    borderBottom: "1px solid #f5f5f5",
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
                      border: "1px solid #f0f0f0",
                      borderRadius: 4,
                      background: "#fafafa",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 15, color: "#222" }}>
                      {product.ProductName}
                    </div>
                    <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>none</div>
                  </div>
                  <div style={{ minWidth: 80, textAlign: "center", color: "#555" }}>
                    x{product.Quantity || "N/A"}
                  </div>
                  <div style={{ minWidth: 120, textAlign: "right", color: blue, fontWeight: 600 }}>
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
                  borderBottom: "1px solid #f5f5f5",
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
                    border: "1px solid #f0f0f0",
                    borderRadius: 4,
                    background: "#fafafa",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 15, color: "#222" }}>
                    {product.ProductName}
                  </div>
                  <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
                    {variant.ProductVariantName}
                  </div>
                </div>
                <div style={{ minWidth: 80, textAlign: "center", color: "#555" }}>
                  x{variant.Quantity}
                </div>
                <div style={{ minWidth: 120, textAlign: "right", color: blue, fontWeight: 600 }}>
                  ₫{Number(variant.Price || 0).toLocaleString("vi-VN")}
                </div>
              </div>
            ));
          })
        )}
      </div>


      <div
        style={{
          background: "#fff",
          borderRadius: 4,
          border: "1px solid #f5f5f5",
          padding: "18px 24px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ fontSize: 16, color: "#555" }}>
          Tổng số tiền:{" "}
          <span style={{ color: blue, fontWeight: 700, fontSize: 22 }}>
            ₫{Number(order.TotalAmount || 0).toLocaleString("vi-VN")}
          </span>
        </div>
      </div>

     
      <div
        style={{
          background: "#fff",
          borderRadius: 4,
          border: "1px solid #f5f5f5",
          padding: "18px 24px",
          marginTop: 18,
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >

      </div>
    </Container>
  );
};

export default OrderDetail;