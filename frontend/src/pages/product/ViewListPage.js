// /pages/product/ViewListPage.jsx
import React, { useEffect, useState } from "react";
import styles from "../../style/product/ViewListPage.module.scss";

export default function ViewListPage({
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  shopId,
  reloadKey,
}) {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    try {
      const shopIdInfo = shopId;
      if (!shopIdInfo) return;

      fetch(`http://localhost:5000/product/shop/${shopId}`)
        .then((res) => res.json())
        .then(setProducts)
        .catch(() => setProducts([]));
    } catch (error) {
      console.error(error);
    }
  }, [shopId, reloadKey]);

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

  // Normalize query once
  const cleanQ = query.replace(/\s+/g, "").toLowerCase();

  const filtered = products.filter((p) => {
    try {
      // 1) Status filter
      if (filter !== "All" && p.Status !== filter) {
        return false;
      }

      // 2) Text search filter
      if (cleanQ) {
        const cleanName = (p.ProductName || "")
          .replace(/\s+/g, "")
          .toLowerCase();
        if (!cleanName.includes(cleanQ)) {
          return false;
        }
      }

      // 3) If we got here, it passes all filters
      return true;
    } catch (err) {
      // In case of any unexpected error, exclude this item
      console.error("Filter error on product", p._id, err);
      return false;
    }
  });

  return (
    <>
      <h1 className={styles.title}>View list product</h1>

      {/* Header row */}
      <div className={styles.headerActions}>
        <div className={styles.row}>
          <div className={styles.filterGroup}>
            {["All", "Active", "Inactive"].map((f) => (
              <button
                key={f}
                className={filter === f ? styles.btnActive : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <button className={styles.addBtn} onClick={onAddProduct}>
            Add new product
          </button>
        </div>

        {/* Row 2: Search + Sort */}
        <div className={styles.row}>
          <div className={styles.search}>
            <input
              placeholder="Search by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button>Search</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>No</th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Change Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={p._id}>
              <td>{i + 1}</td>
              <td>
                {p.ProductImage ? (
                  <img src={p.ProductImage} className={styles.thumb} alt="" />
                ) : (
                  "—"
                )}
              </td>
              <td>{p.ProductName || "—"}</td>
              <td>{p.CategoryId?.CategoryName || "—"}</td>
              <td>
                <button
                  className={styles.changeStatusBtn}
                  onClick={() =>
                    fetch(`http://localhost:5000/product/${p._id}/status`, {
                      method: "PATCH",
                    }).then(() => window.location.reload())
                  }
                >
                  {p.Status}
                </button>
              </td>
              <td>
                <div className={styles.actionButtons}>
                  <button
                    className={styles.editBtn}
                    title="Edit"
                    onClick={() => onEditProduct(p)}
                  >
                    ✎
                  </button>
                  <button
                    className={styles.deleteBtn}
                    title="Delete"
                    onClick={() => onDeleteProduct(p._id)}
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
