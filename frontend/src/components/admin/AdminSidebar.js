"use client";
import "./AdminSidebar.css";
import { useNavigate } from "react-router-dom";

function AdminSidebar({ currentPage = "", isCollapsed, onToggleCollapse }) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "ti ti-home",
      path: "/Ecommerce/admin/admin-dashboard",
    },
    {
      id: "users",
      label: "Users Management",
      icon: "ti ti-users",
      path: "/Ecommerce/admin/userManagement",
    },
    {
      id: "shops",
      label: "Shops Management",
      icon: "ti ti-building-store",
      path: "/Ecommerce/admin/shopManagement",
    },
    {
      id: "categories",
      label: "Categories Management",
      icon: "ti ti-category",
      path: "/Ecommerce/admin/categories",
    },
    // {
    //   id: "products",
    //   label: "Quản lý sản phẩm",
    //   icon: "ti ti-package",
    //   path: "/admin/products",
    // },
    // {
    //   id: "orders",
    //   label: "Quản lý đơn hàng",
    //   icon: "ti ti-shopping-cart",
    //   path: "/admin/orders",
    // },
    {
      id: "payments",
      label: "Payment Method Management",
      icon: "ti ti-credit-card",
      path: "/Ecommerce/admin/paymentManagement",
    },
  ];

  const navigate = useNavigate();

  const handleMenuClick = (path) => {
    navigate(path); // Điều hướng đến path
  };

  return (
    <aside className={`admin-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="brand-logo">
          {!isCollapsed && <h2>Admin Panel</h2>}
          <button className="sidebar-toggle" onClick={onToggleCollapse}>
            <i className="ti ti-menu-2"></i>
          </button>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`nav-item ${currentPage === item.id ? "active" : ""}`}
            >
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleMenuClick(item.path);
                }}
              >
                <i className={item.icon}></i>
                {!isCollapsed && <span>{item.label}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
