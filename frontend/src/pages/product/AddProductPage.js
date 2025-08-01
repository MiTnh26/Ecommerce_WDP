// /pages/product/AddProductPage.js
import React, { useEffect, useState } from "react";
import ProductForm from "../../components/productForm/ProductForm";

export default function AddProductPage({ product, onCancel, shopId }) {
  const [categories, setCategories] = useState([]);
  const [existingProducts, setExistingProducts] = useState([]);

  useEffect(() => {
    if (!shopId) return;
    fetch(`http://localhost:5000/product/shop/${shopId}`)
      .then(res => res.json())
      .then(setExistingProducts)
      .catch(() => setExistingProducts([]));
  }, [shopId]);

  useEffect(() => {
    try {
      const shopIdInfo = shopId;
      if (!shopIdInfo) return;

      fetch(`http://localhost:5000/product/category/shop/${shopIdInfo}`)
        .then((res) => res.json())
        .then(setCategories)
        .catch((err) => {
          console.error("Error loading categories:", err);
          setCategories([]);
        });
    } catch (error) {
      console.error(error);
    }
  }, []);

  // useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem("user") || "{}");
  //   if (!user._id) return;

  //   fetch(`http://localhost:5000/seller/getShopInformation?owner=${user._id}`)
  //     .then((res) => res.json())
  //     .then((shop) => setShopId(shop._id))
  //     .catch(console.error);
  // }, []);

  const handleSave = (data) => {
    if (shopId) {
      data.append("ShopId", shopId);
    } else {
      return Promise.reject(new Error("No shopId available"));
    }

    const method = product ? "PUT" : "POST";
    // append id if editing
    if (product?._id) data.append("id", product._id);

    return fetch("http://localhost:5000/product", {
      method,
      body: data,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Save failed");
        return res.json();
      })
      .then(() => {
        // go back to list
        onCancel();
      });
  };

  return (
    <ProductForm
      categories={categories}
      onSave={handleSave}
      onCancel={onCancel}
      product={product}
      existingProducts={existingProducts}
    />
  );
}
