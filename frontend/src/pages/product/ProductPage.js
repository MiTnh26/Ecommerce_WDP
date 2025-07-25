import React, { useEffect, useState } from "react";
import ProductForm from "../../components/productForm/ProductForm";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:5000/products");
    setProducts(await res.json());
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async formData => {
    // detect new vs update
    const isUpdate = formData.has("id");
    const url    = "http://localhost:5000/product";
    const opts   = {
      method: isUpdate ? "PUT" : "POST",
      body: formData
    };
    await fetch(url, opts);
    setEditing(null);
    fetchProducts();
  };

  const handleAddVariant = async id => {
    const name = prompt("Variant name?");
    if (!name) return;
    await fetch(`http://localhost:5000/product/${id}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ProductVariantName: name,
        Image:              "",
        Price:              0,
        StockQuantity:      0,
        Status:             "Active"
      })
    });
    fetchProducts();
  };

  const handleToggleStatus = async id => {
    await fetch(`http://localhost:5000/product/${id}/status`, { method: "PATCH" });
    fetchProducts();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Products</h1>
      <button onClick={() => setEditing({})}>Add Product</button>
      {editing !== null && (
        <ProductForm
          product={editing._id ? editing : null}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Name</th><th>Status</th><th>Variants</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p.ProductName}</td>
              <td>{p.Status}</td>
              <td>{p.ProductVariant.length}</td>
              <td>
                <button onClick={() => setEditing(p)}>Edit</button>
                <button onClick={() => handleAddVariant(p._id)}>Add Variant</button>
                <button onClick={() => handleToggleStatus(p._id)}>
                  {p.Status === "Active" ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
