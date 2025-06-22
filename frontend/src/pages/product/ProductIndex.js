import React, { useState } from "react";
import SellerLayout from "./SellerLayout";
import ViewListPage from "./ViewListPage";
import AddProductPage from "./AddProductPage";

export default function ProductIndex() {
  const [tab, setTab] = useState("list");

  return (
    <SellerLayout activeTab={tab} onTabSelect={setTab}>
      {tab === "list" ? (
        <ViewListPage onAddProduct={() => setTab("add")} />
      ) : (
        <AddProductPage />
      )}
    </SellerLayout>
  );
}