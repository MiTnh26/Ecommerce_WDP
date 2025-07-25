// /pages/product/ProductIndex.js
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SellerLayout from "./SellerLayout";
import ViewListPage from "./ViewListPage";
import AddProductPage from "./AddProductPage";

export default function ProductIndex() {
  const location = useLocation();
  const [tab, setTab] = useState("list");
  const [editingProduct, setEditingProduct] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [shopId, setShopId] = useState(null);


  useEffect(() => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user._id) return;
  
      fetch(`http://localhost:5000/seller/getShopInformation?owner=${user._id}`)
        .then((res) => res.json())
        .then((shop) => setShopId(shop._id))
        .catch(console.error);
    }, []);

  // optional: you can still read location.state.tab if you like
  useEffect(() => {
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location.state?.tab]);

  // Handlers for ViewListPage buttons
  const handleAdd = () => {
    setEditingProduct(null);
    setTab("add");
  };
  const handleEdit = product => {
    setEditingProduct(product);
    setTab("add");
  };
  const handleDelete = async id => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`http://localhost:5000/product/${id}`, { method: "DELETE" });
    // bump reloadKey to remount ViewListPage
    setReloadKey(k => k + 1);
  };

  return (
    <SellerLayout activeTab={tab} onTabSelect={setTab}>
      {tab === "list" ? (
        <ViewListPage
          key={reloadKey}  
          onAddProduct={handleAdd}
          onEditProduct={handleEdit}
          onDeleteProduct={handleDelete}
          shopId={shopId}
        />
      ) : (
        <AddProductPage
          product={editingProduct}
          onCancel={() => setTab("list")}
          shopId={shopId}
        />
      )}
    </SellerLayout>
  );
}
