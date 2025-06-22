// src/components/ProductForm.jsx
import React, { useState } from 'react';
import styles from '../../style/product/ProductForm.module.scss';

export default function ProductForm({ categories = [], onSave }) {
  const [mainImage, setMainImage] = useState(null);
  const [productName, setProductName] = useState('');
  const [variants, setVariants] = useState([]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleMainImageChange = e => {
    setMainImage(e.target.files[0]);
  };

  const handleVariantChange = (index, field, value) => {
    const copy = [...variants];
    copy[index][field] = value;
    setVariants(copy);
  };

  const addVariant = () => {
    setVariants([...variants, { image: null, name: '', price: '', stock: '' }]);
  };

  const removeVariant = index => {
    const copy = variants.filter((_, i) => i !== index);
    setVariants(copy);
  };

  const handleSave = async e => {
    e.preventDefault();
    const data = new FormData();
    if (mainImage) data.append('ProductImage', mainImage);
    data.append('ProductName', productName);
    data.append('CategoryId', category);
    data.append('Description', description);
    variants.forEach((v, i) => {
      if (v.image) data.append(`VariantImage[${i}]`, v.image);
      data.append(`ProductVariant[${i}][ProductVariantName]`, v.name);
      data.append(`ProductVariant[${i}][Price]`, v.price);
      data.append(`ProductVariant[${i}][StockQuantity]`, v.stock);
    });
    await onSave(data);
  };

  return (
    <form className={styles.form} onSubmit={handleSave}>
      <h2 className={styles.title}>Add New Product</h2>

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
            {mainImage ? mainImage.name : 'Add image (0/9)'}
          </span>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>*Product Name (0/100)</label>
        <input
          type="text"
          value={productName}
          onChange={e => setProductName(e.target.value)}
          className={styles.input}
          placeholder="Enter the product name"
          maxLength={100}
          required
        />
      </div>

      <div className={styles.variantSection}>
        <label className={styles.label}>*Product Variant</label>
        <button type="button" className={styles.addVariantBtn} onClick={addVariant}>
          Add more product variant
        </button>
        {/* Uncomment to enable scrolling */}
        {/* <div className={styles.variantScroll}> */}
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
                    </td>
                    <td>
                      <input
                        type="text"
                        value={v.name}
                        onChange={e => handleVariantChange(i, 'name', e.target.value)}
                        placeholder="Enter product variant name"
                        className={styles.input}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={v.price}
                        onChange={e => handleVariantChange(i, 'price', e.target.value)}
                        placeholder="Enter the price"
                        className={styles.input}
                        step="0.01"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={e => handleVariantChange(i, 'stock', e.target.value)}
                        placeholder="Enter stock quantity"
                        className={styles.input}
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
        {/* </div> */}
      </div>

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
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>*Description (0/3000)</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className={styles.textarea}
          maxLength={3000}
          placeholder="Enter product description"
          required
        />
      </div>

      <button type="submit" className={styles.submitBtn}>
        Add Product
      </button>
    </form>
  );
}
