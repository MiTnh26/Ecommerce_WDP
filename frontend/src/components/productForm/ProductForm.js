// /components/productForm/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import styles from '../../style/product/ProductForm.module.scss';

export default function ProductForm({
  categories = [],
  onSave,
  onCancel,
  product = null,
}) {
  const [mainImage, setMainImage] = useState(null);
  const [mainPreview, setMainPreview] = useState("");
  const [productName, setProductName] = useState('');
  const [variants, setVariants] = useState([]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Prefill on edit
  useEffect(() => {
    if (product) {
      setProductName(product.ProductName || '');
      setCategory(product.CategoryId?._id || '');
      setDescription(product.Description || '');
      setMainPreview(product.ProductImage || '');
      setVariants(
        (product.ProductVariant || []).map(v => ({
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

  const handleMainImageChange = e => {
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
    setVariants(vs => [...vs, { id: null, image: null, imageUrl: '', name: '', price: '', stock: '' }]);
  };

  const removeVariant = i => {
    setVariants(vs => vs.filter((_, idx) => idx !== i));
  };

  const handleSave = async e => {
    e.preventDefault();
    const data = new FormData();

    if (mainImage) {
      data.append('ProductImage', mainImage);
    } else if (mainPreview) {
      data.append('ProductImage', mainPreview);
    }

    data.append('ProductName', productName);
    data.append('CategoryId', category);
    data.append('Description', description);
    if (product?.Status) {
      data.append('Status', product.Status);
    }

    variants.forEach((v, i) => {
      data.append(`ProductVariant[${i}][ProductVariantName]`, v.name);
      data.append(`ProductVariant[${i}][Price]`, v.price);
      data.append(`ProductVariant[${i}][StockQuantity]`, v.stock);  
      if (v.id) data.append(`ProductVariant[${i}][_id]`, v.id);
      if (v.image) {
        data.append('VariantImage', v.image);
      } else {
        data.append(`ProductVariant[${i}][Image]`, v.imageUrl || '');
      }
    });

    await onSave(data);
  };

  return (
    <form className={styles.form} onSubmit={handleSave}>
      <h2 className={styles.title}>
        {product ? 'Edit Product' : 'Add New Product'}
      </h2>

      {/* Product image */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>*Product image</label>
        <div className={styles.uploadBox}>
          <input
            type="file"
            accept="image/*"
            onChange={handleMainImageChange}
            className={styles.fileInput}
          />
          <span className={styles.uploadText}>
            {mainImage
              ? mainImage.name
              : mainPreview
                ? 'Current image'
                : 'Add image (0/9)'}
          </span>
        </div>
        {mainPreview && (
          <img src={mainPreview} className={styles.preview} alt="" />
        )}
      </div>

      {/* Name */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>*Product Name</label>
        <input
          type="text"
          value={productName}
          onChange={e => setProductName(e.target.value)}
          className={styles.input}
          maxLength={100}
          required
        />
      </div>

      {/* Variants */}
      <div className={styles.variantSection}>
        <label className={styles.label}>*Product Variant</label>
        <button type="button" className={styles.addVariantBtn} onClick={addVariant}>
          Add more product variant
        </button>
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
                      onChange={e => handleVariantChange(i, 'image', e.target.files[0])}
                      className={styles.variantFile}
                    />
                    {!v.image && v.imageUrl && (
                      <img src={v.imageUrl} className={styles.variantThumb} alt="" />
                    )}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={v.name}
                      onChange={e => handleVariantChange(i, 'name', e.target.value)}
                      className={styles.input}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={v.price}
                      onChange={e => handleVariantChange(i, 'price', e.target.value)}
                      className={styles.input}
                      step="0.01"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={e => handleVariantChange(i, 'stock', e.target.value)}
                      className={styles.input}
                      required
                    />
                  </td>
                  <td>
                    <button type="button" className={styles.deleteBtn} onClick={() => removeVariant(i)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Category */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>*Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className={styles.select}
          required
        >
          <option value="">Select category</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.CategoryName}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className={styles.fieldGroup}>
        <label className={styles.label}>*Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className={styles.textarea}
          maxLength={3000}
          required
        />
      </div>

      {/* Buttons */}
      <div className={styles.buttonRow}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={variants.length === 0}
        >
          {variants.length === 0
            ? 'Add ≥ 1 Variant'
            : product
              ? 'Update Product'
              : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
