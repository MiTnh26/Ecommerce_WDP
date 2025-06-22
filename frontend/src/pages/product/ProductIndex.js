import React, { useState } from "react";
import Sidebar from "../../components/productSidebar/ProductSidebar";
import ViewListPage from "./ViewListPage";
import AddProductPage from "./AddProductPage";

export default function ProductIndex() {
  const [tab, setTab] = useState("list");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={tab} onSelect={setTab} />
      <main style={{ flex: 1, padding: "1.5rem", background: "#f3f4f6" }}>
        {tab === "list" ? <ViewListPage onAddProduct={() => setTab("add")} /> : <AddProductPage />}
      </main>
    </div>
  );
}
