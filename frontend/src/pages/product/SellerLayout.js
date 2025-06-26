import React from "react";
import Sidebar from "../../components/productSidebar/ProductSidebar";
import ProfileHeader from "../../components/productSidebar/ProductHeader";

export default function SellerLayout({ children, activeTab, onTabSelect }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={activeTab} onSelect={onTabSelect} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <ProfileHeader />
        <main style={{ flex: 1, padding: "1.5rem", background: "#f3f4f6" }}>
          {children}
        </main>
      </div>
    </div>
  );
}