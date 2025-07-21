// /pages/product/ViewListPage.jsx
import React, { useEffect, useState } from "react";
import styles from "../../style/product/ViewListPage.module.scss";

export default function ViewListPage({
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(
    () => {
      fetch("http://localhost:5000/product")
        .then((res) => res.json())
        .then(setProducts)
        .catch(() => setProducts([]));
    },
    [
      /* you could add a reload flag here */
    ]
  );

  const filtered = products.filter((p) => {
    if (filter !== "All" && p.Status !== filter) return false;
    if (query && !p.ProductName?.toLowerCase().includes(query.toLowerCase()))
      return false;
    return true;
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

          <div className={styles.sortBtns}>
            <button className={styles.sortNew}>⬆ Date add new – old</button>
            <button>⬇ Date add old–new</button>
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
