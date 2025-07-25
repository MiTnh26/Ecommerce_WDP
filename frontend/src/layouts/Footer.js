
import React from "react";

const Footer = () => {
  return (
    <footer style={{ backgroundColor: "#ffe88f", color: "black" }}>
      {/* Main Footer */}
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
          }}
        >
          {/* Company Info */}
          <div>
            <h3
              style={{
                color: "#4299e1",
                marginBottom: "15px",
                fontSize: "24px",
              }}
              className="text-black"
            >
              EZ Shop
            </h3>
            <p
              style={{
                color: "black",
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
              className="text-black"
            >
              A simple e-commerce platform, bringing a great shopping experience to customers.
            </p>
          </div>
          {/* Contact Info */}
          <div>
            <h4 style={{ marginBottom: "15px" }} className="text-black">Contact</h4>
            <div
              style={{ color: "black", fontSize: "14px", lineHeight: "1.8" }}
              className="text-black"
            >
              <p style={{ margin: "5px 0" }} className="text-black">
                📍 123 ABC Street, Hoang Mai District, Hanoi City
              </p>
              <p style={{ margin: "5px 0" }} className="text-black">📞 Hotline: 1900 1234</p>
              <p style={{ margin: "5px 0" }} className="text-black">✉️ Email: support@shopeasy.vn</p>
              <p style={{ margin: "5px 0" }} className="text-black">
                🕒 Working hours: 8:00 AM - 10:00 PM daily
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
