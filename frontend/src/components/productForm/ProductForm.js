import React, { useState, useEffect } from "react";

export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    id:                product?._id || "",
    CategoryId:        product?.CategoryId || "",
    ShopId:            product?.ShopId || "",
    ProductName:       product?.ProductName || "",
    Description:       product?.Description || "",
    Status:            product?.Status || "Active",
    // for main image
    ProductImage:      null, 
  });

  useEffect(() => {
    if (product) {
      setForm({
        id:           product._id,
        CategoryId:   product.CategoryId,
        ShopId:       product.ShopId,
        ProductName:  product.ProductName,
        Description:  product.Description,
        Status:       product.Status,
        ProductImage: null, // reset file input
      });
    }
  }, [product]);

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Build form data
    const data = new FormData();
    if (form.id) data.append("id", form.id);
    data.append("CategoryId", form.CategoryId);
    data.append("ShopId", form.ShopId);
    data.append("ProductName", form.ProductName);
    data.append("Description", form.Description);
    data.append("Status", form.Status);
    if (form.ProductImage) {
      data.append("ProductImage", form.ProductImage);
    }
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
      <div>
        <label>CategoryId
          <input name="CategoryId" value={form.CategoryId} onChange={handleChange} required />
        </label>
      </div>
      <div>
        <label>ShopId
          <input name="ShopId" value={form.ShopId} onChange={handleChange} required />
        </label>
      </div>
      <div>
        <label>ProductName
          <input name="ProductName" value={form.ProductName} onChange={handleChange} required />
        </label>
      </div>
      <div>
        <label>Description
          <input name="Description" value={form.Description} onChange={handleChange} />
        </label>
      </div>
      <div>
        <label>Status
          <select name="Status" value={form.Status} onChange={handleChange}>
            <option>Active</option><option>Inactive</option>
          </select>
        </label>
      </div>
      <div>
        <label>ProductImage
          <input name="ProductImage" type="file" accept="image/*" onChange={handleChange} />
        </label>
      </div>
      <button type="submit">Save Product</button>
      {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
    </form>
  );
}
