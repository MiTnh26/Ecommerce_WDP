import React, { useEffect, useState } from "react";
import ProductForm from "../../components/productForm/ProductForm";

export default function AddProductPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/category")
      .then(res => res.json())
      .then(setCategories);
  }, []);

  const handleSave = data => {
    return fetch("http://localhost:5000/product", {
      method: "POST",
      body: data,
    }).then(res => {
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    });
  };

  return (
    <ProductForm
      categories={categories}
      onSave={handleSave}
      onCancel={() => {}}
    />
  );
}
