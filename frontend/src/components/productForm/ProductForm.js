import React, { useState, useEffect } from "react";
import styles from "../../style/product/ProductForm.module.scss";

export default function ProductForm({
  categories = [],
  onSave,
  onCancel,
  product = null,
  existingProducts = [],
}) {
  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState("");
  const [productName, setProductName] = useState("");
  const [variants, setVariants] = useState([]);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [submitAttempt, setSubmitAttempt] = useState(false);

  // validation errors
  const [nameError, setNameError] = useState("");
  const [descError, setDescError] = useState("");
  const [variantNameError, setVariantNameError] = useState("");
  const [variantDetailError, setVariantDetailError] = useState("");
  const [imageError, setImageError] = useState("");
  const [variantImageError, setVariantImageError] = useState("");

  useEffect(() => {
    if (product) {
      setProductName(product.ProductName || "");
      setCategory(product.CategoryId?._id || "");
      setDescription(product.Description || "");
      setMainPreview(product.ProductImage || "");
      setVariants(
        (product.ProductVariant || []).map((v) => ({
          id: v._id,
          image: null,
          imageUrl: v.Image,
          name: v.ProductVariantName,
          price: v.Price,
          stock: v.StockQuantity,
        }))
      );
    }
  }, [product]);

  useEffect(() => {
    const name = productName.trim().toLowerCase();
    const conflict = existingProducts.some(
      (p) =>
        p.ProductName.trim().toLowerCase() === name &&
        (!product || p._id !== product._id)
    );
    setNameError(conflict ? "A product with this name already exists." : "");
  }, [productName, existingProducts, product]);

  useEffect(() => {
    if (!description || description.length < 50) {
      setDescError("Description must be at least 50 characters.");
    } else {
      setDescError("");
    }
  }, [description]);

  useEffect(() => {
    const seen = new Set();
    let conflict = false;
    const existingNames = (product?.ProductVariant || []).map((v) =>
      v.ProductVariantName.trim().toLowerCase()
    );

    variants.forEach((v) => {
      const nm = v.name.trim().toLowerCase();
      if (!nm) return;
      if (existingNames.includes(nm) || seen.has(nm)) {
        conflict = true;
      }
      seen.add(nm);
    });
    setVariantNameError(conflict ? "Variant names must be unique." : "");
  }, [variants, product]);

  useEffect(() => {
    let bad = false;
    variants.forEach((v) => {
      const price = parseFloat(v.price);
      const stock = parseInt(v.stock, 10);
      if (isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
        bad = true;
      }
    });
    setVariantDetailError(
      bad ? "Each variant must have price > 0 and stock ≥ 0." : ""
    );
  }, [variants]);

  useEffect(() => {
    if (!mainImage && !mainPreview) {
      setImageError("Product image is required.");
    } else {
      setImageError("");
    }
  }, [mainImage, mainPreview]);

  useEffect(() => {
    let missing = false;
    variants.forEach((v) => {
      if (!v.image && !v.imageUrl) missing = true;
    });
    setVariantImageError(missing ? "Each variant must include an image." : "");
  }, [variants]);

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    setMainImage(file);
    setMainPreview(URL.createObjectURL(file));
  };

  const handleVariantChange = (i, field, val) => {
    const c = [...variants];
    c[i][field] = val;
    setVariants(c);
  };

  const addVariant = () => {
    setVariants((vs) => [
      ...vs,
      { id: null, image: null, imageUrl: "", name: "", price: "", stock: "" },
    ]);
  };

  const removeVariant = (i) => {
    setVariants((vs) => vs.filter((_, idx) => idx !== i));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitAttempt(true);

    if (
      nameError ||
      descError ||
      variantNameError ||
      variantDetailError ||
      imageError ||
      variantImageError ||
      variants.length === 0
    ) {
      return;
    }

    const data = new FormData();

    if (mainImage) {
      data.append("ProductImage", mainImage);
    } else if (mainPreview) {
      data.append("ProductImage", mainPreview);
    }

    data.append("ProductName", productName);
    data.append("CategoryId", category);
    data.append("Description", description);
    if (product?.Status) data.append("Status", product.Status);

    variants.forEach((v, i) => {
      data.append(`ProductVariant[${i}][ProductVariantName]`, v.name);
      data.append(`ProductVariant[${i}][Price]`, v.price);
      data.append(`ProductVariant[${i}][StockQuantity]`, v.stock);
      if (v.id) data.append(`ProductVariant[${i}][_id]`, v.id);
      if (v.image) {
        data.append("VariantImage", v.image);
      } else {
        data.append(`ProductVariant[${i}][Image]`, v.imageUrl || "");
      }
    });

    await onSave(data);
  };

  return (
    <form className={styles.form} onSubmit={handleSave}>
      <h2 className={styles.title}>
        {product ? "Edit Product" : "Add New Product"}
      </h2>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>*Product image</label>
        <div className={styles.uploadBox}>
          <input
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
            className={styles.fileInput}
          />

          {mainPreview ? (
            <img
              src={mainPreview}
              alt="Product preview"
              className={styles.preview}
            />
          ) : (
            <span className={styles.uploadText}>
              {mainImage ? mainImage.name : "Add image"}
            </span>
          )}
        </div>
        {submitAttempt && imageError && (
          <p className={styles.errorText}>{imageError}</p>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>*Product Name</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className={styles.input}
          maxLength={100}
          required
        />
        {submitAttempt && nameError && (
          <p className={styles.errorText}>{nameError}</p>
        )}
      </div>

      <div className={styles.variantSection}>
        <label className={styles.label}>*Product Variant</label>
        <button
          type="button"
          className={styles.addVariantBtn}
          onClick={addVariant}
        >
          Add more product variant
        </button>
        {submitAttempt && variantNameError && (
          <p className={styles.errorText}>{variantNameError}</p>
        )}
        {submitAttempt && variantDetailError && (
          <p className={styles.errorText}>{variantDetailError}</p>
        )}
        {submitAttempt && variantImageError && (
          <p className={styles.errorText}>{variantImageError}</p>
        )}
        {variants.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product Variant Image</th>
                <th>Product Variant Name</th>
                <th>Price</th>
                <th>Stock Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleVariantChange(i, "image", e.target.files[0])
                      }
                      className={styles.variantFile}
                    />
                    {!v.image && v.imageUrl && (
                      <img
                        src={v.imageUrl}
                        className={styles.variantThumb}
                        alt=""
                      />
                    )}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) =>
                        handleVariantChange(i, "name", e.target.value)
                      }
                      className={styles.input}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) =>
                        handleVariantChange(i, "price", e.target.value)
                      }
                      className={styles.input}
                      step="0.01"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        handleVariantChange(i, "stock", e.target.value)
                      }
                      className={styles.input}
                      required
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => removeVariant(i)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>*Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.select}
          required
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.CategoryName}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>*Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          maxLength={3000}
          required
        />
        {submitAttempt && descError && (
          <p className={styles.errorText}>{descError}</p>
        )}
      </div>

      <div className={styles.buttonRow}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={
            variants.length === 0
            // ||
            // Boolean(nameError) ||
            // Boolean(descError) ||
            // Boolean(variantNameError) ||
            // Boolean(variantDetailError) ||
            // Boolean(imageError) ||
            // Boolean(variantImageError)
          }
        >
          {variants.length === 0
            ? "Add ≥ 1 Variant"
            : product
            ? "Update Product"
            : "Add Product"}
        </button>
      </div>
    </form>
  );
}
