import "./AdminHeader.css";

function AdminHeader({ title = "Dashboard", user = null }) {
  const defaultUser = {
    name: "Admin",
    avatar: "/placeholder.svg?height=32&width=32",
  };

  const currentUser = user || defaultUser;

  const handleProfileClick = () => {
    console.log("Navigate to profile");
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      console.log("Logout");
      // Handle logout logic here
    }
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
