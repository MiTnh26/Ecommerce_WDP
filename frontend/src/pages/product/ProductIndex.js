import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SellerLayout from "./SellerLayout";
import ViewListPage from "./ViewListPage";
import AddProductPage from "./AddProductPage";

export default function ProductIndex() {
  const location = useLocation();
  const [tab, setTab] = useState("list");

  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location.state?.tab]);

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
