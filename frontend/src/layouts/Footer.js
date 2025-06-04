import React from 'react'

const Footer = () => {
  return (
    <footer style={{ backgroundColor: "#2d3748", color: "white" }}>
      {/* Main Footer */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
          }}
        >
          {/* Company Info */}
          <div>
            <h3 style={{ color: "#4299e1", marginBottom: "15px", fontSize: "24px" }}>EZ SHop</h3>
            <p style={{ color: "#a0aec0", lineHeight: "1.6", marginBottom: "20px" }}>
              Sàn thương mại điện tử đơn giản, mang đến trải nghiệm mua sắm tuyệt vời cho khách hàng Việt Nam.
            </p>
</div>

          {/* Quick Links */}
          <div>
            <h4 style={{ marginBottom: "15px" }}>Liên kết nhanh</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {["Trang chủ", "Sản phẩm", "Về chúng tôi", "Liên hệ", "Chính sách", "Hỗ trợ"].map((link) => (
                <li key={link} style={{ marginBottom: "8px" }}>
                  <a
                    href="/"
                    style={{
                      color: "#a0aec0",
                      textDecoration: "none",
                      fontSize: "14px",
                      transition: "color 0.3s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "white")}
                    onMouseLeave={(e) => (e.target.style.color = "#a0aec0")}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ marginBottom: "15px" }}>Liên hệ</h4>
            <div style={{ color: "#a0aec0", fontSize: "14px", lineHeight: "1.8" }}>
              <p style={{ margin: "5px 0" }}>📍 123 Đường ABC, Quận 1, TP.HCM</p>
              <p style={{ margin: "5px 0" }}>📞 Hotline: 1900 1234</p>
              <p style={{ margin: "5px 0" }}>✉️ Email: support@shopeasy.vn</p>
              <p style={{ margin: "5px 0" }}>🕒 Thời gian: 8:00 - 22:00 hàng ngày</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 style={{ marginBottom: "15px" }}>Nhận tin khuyến mãi</h4>
            <p style={{ color: "#a0aec0", fontSize: "14px", marginBottom: "15px" }}>
              Đăng ký để nhận thông tin sản phẩm mới và ưu đãi đặc biệt
            </p>
            <form>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  border: "1px solid #4a5568",
                  borderRadius: "5px",
                  backgroundColor: "#4a5568",
                  color: "white",
                  fontSize: "14px",
                }}
              />
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#4299e1",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#3182ce")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#4299e1")}
              >
                Đăng ký ngay
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      {/* <div style={{ borderTop: "1px solid #4a5568", backgroundColor: "#1a202c" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
          }}
        > */}
          {/* Payment Methods */}
          {/* <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
            <span style={{ color: "#a0aec0", fontSize: "14px" }}>Thanh toán:</span>
            <div style={{ display: "flex", gap: "8px" }}>
              {["💳", "🏧", "📱", "💰"].map((icon, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "white",
                    padding: "5px 8px",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div> */}

          {/* Copyright */}
           {/* <div style={{ textAlign: "center" }}>
            <p style={{ color: "#a0aec0", fontSize: "14px", margin: 0 }}>© 2024 ShopEasy. Tất cả quyền được bảo lưu.</p>
          </div> 
        </div>
      </div> */}
    </footer>
  )
}

export default Footer