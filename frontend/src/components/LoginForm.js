import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "bootstrap/dist/css/bootstrap.min.css";

function Login() {
  const [Email, setEmail] = useState("");
  const [Password, setPass] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ Email, Password: Password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Đăng nhập thành công!");

        // chuyển hướng nếu cần
      } else {
        alert(data.message || "Sai tài khoản hoặc mật khẩu");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  };
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      // Gửi token hoặc email đến server để xử lý đăng nhập/đăng ký
      const res = await fetch("http://localhost:5000/customer/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Đăng nhập bằng Google thành công!");
        // chuyển hướng nếu cần
      } else {
        alert(data.message || "Đăng nhập Google thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xử lý đăng nhập Google");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="d-flex align-items-center p-3">
        <a href="/" className="d-flex align-items-center text-decoration-none">
          <img
            src="/logo-ecommerce.jpg"
            alt="Logo"
            style={{ height: "40px", marginRight: "8px" }}
          />
        </a>
        <span style={{ fontSize: "18px", marginLeft: "20px" }}>Đăng nhập</span>
      </div>

      {/* FORM LOGIN */}
      <section className="vh-100">
        <div className="container h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-md-9 col-lg-6 col-xl-5">
              <img
                src="/logo-ecommerce.jpg"
                className="img-fluid"
                alt="login illustration"
              />
            </div>

            <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label">Email:</label>
                  <input
                    type="username"
                    className="form-control form-control-lg"
                    placeholder="Enter email"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password:</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={Password}
                    onChange={(e) => setPass(e.target.value)}
                    required
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <a href="/forgot-password" className="text-body">
                    Forgot password?
                  </a>
                </div>

                <div className="text-center text-lg-start mt-4 pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                  >
                    Login
                  </button>
                  <div className="my-3 text-center">hoặc</div>

                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => alert("Lỗi đăng nhập Google")}
                  />

                  <p className="small fw-bold mt-2 pt-1 mb-0">
                    Don't have an account?{" "}
                    <a href="/Ecommerce/register" className="link-danger">
                      Register
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
