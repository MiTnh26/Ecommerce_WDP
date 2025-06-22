"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import "./AdminLayout.css";

function AdminLayout({ children, currentPage, pageTitle, user }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        currentPage={currentPage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className="admin-main">
        <AdminHeader title={pageTitle} user={user} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
