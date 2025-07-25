import "./AdminHeader.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function AdminHeader({ title = "Dashboard", user = null }) {
  const navigate = useNavigate();
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    // Get admin id from localStorage (prefer userId key)
    let adminId = localStorage.getItem("userId");
    if (!adminId) {
      // fallback: try to get from user object
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        adminId = userData.id || userData.userId || userData.ID;
      }
    }
    if (!adminId) return;
    fetch(`http://localhost:5000/admin/${adminId}`)
      .then((res) => res.json())
      .then((data) => setAdminInfo(data))
      .catch((err) => setAdminInfo(null));
  }, []);

  const currentUser = adminInfo
    ? {
        name: adminInfo.FirstName && adminInfo.LastName ? `${adminInfo.FirstName} ${adminInfo.LastName}` : adminInfo.Username || "Admin",
        avatar: adminInfo.Image || "/placeholder.svg?height=32&width=32",
      }
    : user || { name: "Admin", avatar: "/placeholder.svg?height=32&width=32" };

  // Debug: Log adminInfo and avatar URL
  console.log('AdminHeader adminInfo:', adminInfo);
  console.log('AdminHeader avatar src:', currentUser.avatar);

  const handleProfileClick = () => {
    window.location.href = "http://localhost:3000/Ecommerce/admin/profile";
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/Ecommerce/home");
    window.location.reload();
  };

  return (
    <header className="admin-header">
      <div className="header-content">
        <h1>{title}</h1>
        <div className="user-menu">
          <div className="dropdown">
            <button className="user-avatar" data-toggle="dropdown">
              <img
                src={currentUser.avatar || "/placeholder.svg"}
                alt={currentUser.name}
              />
            </button>
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">Quản trị viên</span>
              </div>
              <div className="dropdown-divider"></div>
              <a
                href="#"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  handleProfileClick();
                }}
              >
                <i className="ti ti-user"></i>
                Hồ sơ của tôi
              </a>
              <a
                href="#"
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <i className="ti ti-logout"></i>
                Đăng xuất
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
